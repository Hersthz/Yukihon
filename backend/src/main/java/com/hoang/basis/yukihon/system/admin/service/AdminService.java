package com.hoang.basis.yukihon.system.admin.service;

import com.hoang.basis.yukihon.system.admin.dto.ContentLevelBreakdownDto;
import com.hoang.basis.yukihon.system.admin.dto.ContentOverviewDto;
import com.hoang.basis.yukihon.system.admin.dto.QuizAnalyticsDto;
import com.hoang.basis.yukihon.system.admin.dto.QuizCohortAccuracyDto;
import com.hoang.basis.yukihon.system.admin.dto.QuizPatternAnalyticsDto;
import com.hoang.basis.yukihon.system.admin.dto.QuizQuestionAnalyticsDto;
import com.hoang.basis.yukihon.system.admin.dto.SystemStatsDto;
import com.hoang.basis.yukihon.system.admin.dto.UpdateUserRolesRequest;
import com.hoang.basis.yukihon.system.admin.dto.UpdateUserStatusRequest;
import com.hoang.basis.yukihon.system.admin.dto.UserManagementDto;
import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.grammar.entity.Grammar;
import com.hoang.basis.yukihon.system.grammar.repository.GrammarRepository;
import com.hoang.basis.yukihon.system.lesson.entity.Lesson;
import com.hoang.basis.yukihon.system.lesson.repository.LessonRepository;
import com.hoang.basis.yukihon.system.quiz.entity.Quiz;
import com.hoang.basis.yukihon.system.quiz.repository.QuizRepository;
import com.hoang.basis.yukihon.system.quizattempt.entity.QuizAttempt;
import com.hoang.basis.yukihon.system.quizattempt.repository.QuizAttemptRepository;
import com.hoang.basis.yukihon.system.user.entity.RoleName;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import com.hoang.basis.yukihon.system.vocabulary.entity.Vocabulary;
import com.hoang.basis.yukihon.system.vocabulary.repository.VocabularyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final VocabularyRepository vocabularyRepository;
    private final GrammarRepository grammarRepository;
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    /**
     * Get all users with pagination
     */
    public Page<UserManagementDto> getAllUsers(Pageable pageable) {
        log.info("Fetching all users with pagination: {}", pageable);
        return userRepository.findAll(pageable)
                .map(UserManagementDto::fromEntity);
    }

    /**
     * Get user by ID
     */
    public UserManagementDto getUserById(Long userId) {
        return UserManagementDto.fromEntity(findUserByIdOrThrow(userId));
    }

    /**
     * Update user roles
     */
    @Transactional
    public UserManagementDto updateUserRoles(Long userId, UpdateUserRolesRequest request) {
        log.info("Updating roles for user {}: {}", userId, request.getRoles());
        
        User user = findUserByIdOrThrow(userId);

        Set<RoleName> roles = request.getRoles().stream()
                .map(String::toUpperCase)
                .map(RoleName::valueOf)
                .collect(Collectors.toSet());

        if (!roles.contains(RoleName.ADMIN)) {
            ensureNotRemovingLastAdmin(user);
        }
        user.setRoles(roles);
        User updated = userRepository.save(user);

        log.info("Successfully updated roles for user {}", userId);
        return UserManagementDto.fromEntity(updated);
    }

    /** Guards against the system being left with zero administrators. */
    private void ensureNotRemovingLastAdmin(User user) {
        if (user.getRoles() != null
                && user.getRoles().contains(RoleName.ADMIN)
                && userRepository.countUsersByRole(RoleName.ADMIN) <= 1) {
            throw new IllegalArgumentException("Cannot remove or disable the last administrator");
        }
    }

    /**
     * Update user enabled/disabled status
     */
    @Transactional
    public UserManagementDto updateUserStatus(Long userId, UpdateUserStatusRequest request) {
        log.info("Updating status for user {}: enabled={}", userId, request.getEnabled());
        
        User user = findUserByIdOrThrow(userId);

        if (Boolean.FALSE.equals(request.getEnabled())) {
            ensureNotRemovingLastAdmin(user);
        }
        user.setEnabled(request.getEnabled());
        User updated = userRepository.save(user);
        
        log.info("Successfully updated status for user {}", userId);
        return UserManagementDto.fromEntity(updated);
    }

    /**
     * Delete user (soft delete by disabling)
     */
    @Transactional
    public void deleteUser(Long userId) {
        log.info("Deleting user {}", userId);
        
        User user = findUserByIdOrThrow(userId);

        ensureNotRemovingLastAdmin(user);
        user.setEnabled(false);
        userRepository.save(user);

        log.info("Successfully disabled user {}", userId);
    }

    /**
     * Get system statistics for admin dashboard
     */
    public SystemStatsDto getSystemStats() {
        log.info("Fetching system statistics");
        
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByEnabled(true);
        long adminUsers = userRepository.countUsersByRole(RoleName.ADMIN);
        long totalLessons = lessonRepository.count();
        long totalVocabulary = vocabularyRepository.count();
        long totalGrammar = grammarRepository.count();
        long totalQuizzes = quizRepository.count();

        return SystemStatsDto.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .adminUsers(adminUsers)
                .totalLessons(totalLessons)
                .totalVocabulary(totalVocabulary)
                .totalGrammar(totalGrammar)
                .totalQuizzes(totalQuizzes)
                .build();
    }

    public ContentOverviewDto getContentOverview() {
        log.info("Fetching admin content overview");

        long totalLessons = lessonRepository.count();
        long publishedLessons = lessonRepository.countByStatus(Lesson.LessonStatus.PUBLISHED);
        long draftLessons = lessonRepository.countByStatus(Lesson.LessonStatus.DRAFT);
        long reviewLessons = lessonRepository.countByStatus(Lesson.LessonStatus.REVIEW);
        long archivedLessons = lessonRepository.countByStatus(Lesson.LessonStatus.ARCHIVED);
        long totalVocabulary = vocabularyRepository.count();
        long totalGrammar = grammarRepository.count();
        long totalQuizzes = quizRepository.count();

        Map<String, ContentLevelAccumulator> levelMap = new LinkedHashMap<>();
        initializeLevelMap(levelMap);

        lessonRepository.findAll().forEach(lesson -> levelMap
                .computeIfAbsent(normalizeLevel(lesson.getJlptLevel()), ignored -> new ContentLevelAccumulator())
                .lessons++);
        vocabularyRepository.findAll().forEach(vocabulary -> levelMap
                .computeIfAbsent(normalizeLevel(vocabulary.getJlptLevel()), ignored -> new ContentLevelAccumulator())
                .vocabulary++);
        grammarRepository.findAll().forEach(grammar -> levelMap
                .computeIfAbsent(normalizeLevel(grammar.getJlptLevel()), ignored -> new ContentLevelAccumulator())
                .grammar++);
        quizRepository.findAll().forEach(quiz -> levelMap
                .computeIfAbsent(normalizeLevel(quiz.getJlptLevel()), ignored -> new ContentLevelAccumulator())
                .quizzes++);

        List<ContentLevelBreakdownDto> levelBreakdown = levelMap.entrySet().stream()
                .map(entry -> ContentLevelBreakdownDto.builder()
                        .jlptLevel(entry.getKey())
                        .lessons(entry.getValue().lessons)
                        .vocabulary(entry.getValue().vocabulary)
                        .grammar(entry.getValue().grammar)
                        .quizzes(entry.getValue().quizzes)
                        .total(entry.getValue().total())
                        .build())
                .collect(Collectors.toList());

        return ContentOverviewDto.builder()
                .totalLessons(totalLessons)
                .publishedLessons(publishedLessons)
                .draftLessons(draftLessons)
                .reviewLessons(reviewLessons)
                .archivedLessons(archivedLessons)
                .totalVocabulary(totalVocabulary)
                .totalGrammar(totalGrammar)
                .totalQuizzes(totalQuizzes)
                .totalContentItems(totalLessons + totalVocabulary + totalGrammar + totalQuizzes)
                .levelBreakdown(levelBreakdown)
                .build();
    }

    public QuizAnalyticsDto getQuizAnalytics() {
        log.info("Fetching admin quiz analytics");

        List<QuizAttempt> attempts = quizAttemptRepository.findAll();
        if (attempts.isEmpty()) {
            return QuizAnalyticsDto.builder()
                    .totalAttempts(0)
                    .correctAttempts(0)
                    .wrongAttempts(0)
                    .overallAccuracy(0)
                    .mostCommonPattern(null)
                    .mostMissedQuestions(List.of())
                    .patternBreakdown(List.of())
                    .cohortAccuracy(List.of())
                    .build();
        }

        Map<Long, Quiz> quizById = quizRepository.findAllById(attempts.stream()
                        .map(QuizAttempt::getQuizId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet()))
                .stream()
                .collect(Collectors.toMap(Quiz::getId, Function.identity()));

        Map<Long, QuizQuestionAccumulator> questionMap = new LinkedHashMap<>();
        Map<String, Long> patternMap = new LinkedHashMap<>();
        Map<String, CohortAccumulator> cohortMap = new LinkedHashMap<>();

        long correctAttempts = 0;
        for (QuizAttempt attempt : attempts) {
            Quiz quiz = quizById.get(attempt.getQuizId());
            if (attempt.isCorrect()) {
                correctAttempts++;
            }

            questionMap.computeIfAbsent(attempt.getQuizId(), quizId -> new QuizQuestionAccumulator(quizId, quiz))
                    .record(attempt);

            if (!attempt.isCorrect() && attempt.getMistakePattern() != null && !attempt.getMistakePattern().isBlank()) {
                String pattern = attempt.getMistakePattern().trim().toLowerCase(Locale.ROOT);
                patternMap.merge(pattern, 1L, Long::sum);
            }

            recordCohort(cohortMap, "JLPT", normalizeLevel(quiz != null ? quiz.getJlptLevel() : null), attempt.isCorrect());
            recordCohort(cohortMap, "DIFFICULTY", normalizeCohortValue(quiz != null ? quiz.getDifficultyLevel() : null), attempt.isCorrect());
        }

        long totalAttempts = attempts.size();
        long wrongAttempts = totalAttempts - correctAttempts;

        List<QuizPatternAnalyticsDto> patternBreakdown = patternMap.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(entry -> QuizPatternAnalyticsDto.builder()
                        .pattern(entry.getKey())
                        .wrongAttempts(entry.getValue())
                        .build())
                .collect(Collectors.toList());

        List<QuizQuestionAnalyticsDto> mostMissedQuestions = questionMap.values().stream()
                .filter(item -> item.wrongAttempts > 0)
                .sorted((left, right) -> {
                    int wrongCompare = Long.compare(right.wrongAttempts, left.wrongAttempts);
                    return wrongCompare != 0 ? wrongCompare : Long.compare(right.totalAttempts, left.totalAttempts);
                })
                .limit(10)
                .map(QuizQuestionAccumulator::toDto)
                .collect(Collectors.toList());

        List<QuizCohortAccuracyDto> cohortAccuracy = cohortMap.values().stream()
                .map(CohortAccumulator::toDto)
                .collect(Collectors.toList());

        return QuizAnalyticsDto.builder()
                .totalAttempts(totalAttempts)
                .correctAttempts(correctAttempts)
                .wrongAttempts(wrongAttempts)
                .overallAccuracy(percentage(correctAttempts, totalAttempts))
                .mostCommonPattern(patternBreakdown.isEmpty() ? null : patternBreakdown.get(0).getPattern())
                .mostMissedQuestions(mostMissedQuestions)
                .patternBreakdown(patternBreakdown)
                .cohortAccuracy(cohortAccuracy)
                .build();
    }

    public String exportQuizAnalyticsCsv() {
        QuizAnalyticsDto analytics = getQuizAnalytics();
        StringBuilder csv = new StringBuilder();
        csv.append("quizId,title,jlptLevel,difficultyLevel,quizType,totalAttempts,wrongAttempts,accuracyRate,topPattern\n");

        analytics.getMostMissedQuestions().forEach(item -> csv
                .append(item.getQuizId() != null ? item.getQuizId() : "")
                .append(',')
                .append(csvEscape(item.getTitle()))
                .append(',')
                .append(csvEscape(item.getJlptLevel()))
                .append(',')
                .append(csvEscape(item.getDifficultyLevel()))
                .append(',')
                .append(csvEscape(item.getQuizType()))
                .append(',')
                .append(item.getTotalAttempts())
                .append(',')
                .append(item.getWrongAttempts())
                .append(',')
                .append(String.format(Locale.ROOT, "%.2f", item.getAccuracyRate()))
                .append(',')
                .append(csvEscape(item.getTopPattern()))
                .append('\n'));

        return csv.toString();
    }

    /**
     * Search users by email or display name
     */
    public List<UserManagementDto> searchUsers(String query) {
        log.info("Searching users with query: {}", query);

        String normalizedQuery = query == null ? "" : query.trim();

        if (normalizedQuery.isEmpty()) {
            return List.of();
        }

        List<User> users = userRepository
            .findTop100ByEmailContainingIgnoreCaseOrDisplayNameContainingIgnoreCaseOrderByCreatedAtDesc(
                normalizedQuery,
                normalizedQuery
            );

        return users.stream()
                .map(UserManagementDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Promote user to admin
     */
    @Transactional
    public UserManagementDto promoteToAdmin(Long userId) {
        log.info("Promoting user {} to admin", userId);
        
        User user = findUserByIdOrThrow(userId);

        Set<RoleName> roles = new HashSet<>(user.getRoles());
        roles.add(RoleName.ADMIN);
        user.setRoles(roles);
        
        User updated = userRepository.save(user);
        
        log.info("Successfully promoted user {} to admin", userId);
        return UserManagementDto.fromEntity(updated);
    }

    /**
     * Demote admin to user
     */
    @Transactional
    public UserManagementDto demoteFromAdmin(Long userId) {
        log.info("Demoting user {} from admin", userId);
        
        User user = findUserByIdOrThrow(userId);

        ensureNotRemovingLastAdmin(user);
        Set<RoleName> roles = new HashSet<>(user.getRoles());
        roles.remove(RoleName.ADMIN);
        if (roles.isEmpty()) {
            roles.add(RoleName.USER);
        }
        user.setRoles(roles);
        
        User updated = userRepository.save(user);
        
        log.info("Successfully demoted user {} from admin", userId);
        return UserManagementDto.fromEntity(updated);
    }

    private void recordCohort(Map<String, CohortAccumulator> cohortMap, String dimension, String value, boolean correct) {
        String key = dimension + ":" + value;
        cohortMap.computeIfAbsent(key, ignored -> new CohortAccumulator(dimension, value))
                .record(correct);
    }

    private double percentage(long numerator, long denominator) {
        if (denominator <= 0) {
            return 0;
        }
        return Math.round((numerator * 10000.0 / denominator)) / 100.0;
    }

    private String normalizeCohortValue(String value) {
        if (value == null || value.isBlank()) {
            return "OTHER";
        }
        return value.trim().toUpperCase(Locale.ROOT);
    }

    private String csvEscape(String value) {
        if (value == null) {
            return "";
        }

        String escaped = value.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }

    private User findUserByIdOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private void initializeLevelMap(Map<String, ContentLevelAccumulator> levelMap) {
        levelMap.put("N5", new ContentLevelAccumulator());
        levelMap.put("N4", new ContentLevelAccumulator());
        levelMap.put("N3", new ContentLevelAccumulator());
        levelMap.put("N2", new ContentLevelAccumulator());
        levelMap.put("N1", new ContentLevelAccumulator());
        levelMap.put("OTHER", new ContentLevelAccumulator());
    }

    private String normalizeLevel(String level) {
        if (level == null || level.isBlank()) {
            return "OTHER";
        }

        String normalized = level.trim().toUpperCase(Locale.ROOT);
        return Set.of("N5", "N4", "N3", "N2", "N1").contains(normalized) ? normalized : "OTHER";
    }

    private static final class ContentLevelAccumulator {
        private long lessons;
        private long vocabulary;
        private long grammar;
        private long quizzes;

        private long total() {
            return lessons + vocabulary + grammar + quizzes;
        }
    }

    private final class QuizQuestionAccumulator {
        private final Long quizId;
        private final Quiz quiz;
        private final Map<String, Long> patternCounts = new LinkedHashMap<>();
        private long totalAttempts;
        private long correctAttempts;
        private long wrongAttempts;

        private QuizQuestionAccumulator(Long quizId, Quiz quiz) {
            this.quizId = quizId;
            this.quiz = quiz;
        }

        private void record(QuizAttempt attempt) {
            totalAttempts++;
            if (attempt.isCorrect()) {
                correctAttempts++;
                return;
            }

            wrongAttempts++;
            if (attempt.getMistakePattern() != null && !attempt.getMistakePattern().isBlank()) {
                patternCounts.merge(attempt.getMistakePattern().trim().toLowerCase(Locale.ROOT), 1L, Long::sum);
            }
        }

        private QuizQuestionAnalyticsDto toDto() {
            String topPattern = patternCounts.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse(null);

            return QuizQuestionAnalyticsDto.builder()
                    .quizId(quizId)
                    .title(quiz != null ? quiz.getTitle() : "Quiz #" + quizId)
                    .jlptLevel(quiz != null ? normalizeLevel(quiz.getJlptLevel()) : "OTHER")
                    .difficultyLevel(quiz != null ? normalizeCohortValue(quiz.getDifficultyLevel()) : "OTHER")
                    .quizType(quiz != null && quiz.getQuizType() != null ? quiz.getQuizType().name() : "UNKNOWN")
                    .totalAttempts(totalAttempts)
                    .wrongAttempts(wrongAttempts)
                    .accuracyRate(percentage(correctAttempts, totalAttempts))
                    .topPattern(topPattern)
                    .build();
        }
    }

    private final class CohortAccumulator {
        private final String dimension;
        private final String value;
        private long totalAttempts;
        private long correctAttempts;

        private CohortAccumulator(String dimension, String value) {
            this.dimension = dimension;
            this.value = value;
        }

        private void record(boolean correct) {
            totalAttempts++;
            if (correct) {
                correctAttempts++;
            }
        }

        private QuizCohortAccuracyDto toDto() {
            return QuizCohortAccuracyDto.builder()
                    .dimension(dimension)
                    .value(value)
                    .totalAttempts(totalAttempts)
                    .correctAttempts(correctAttempts)
                    .accuracyRate(percentage(correctAttempts, totalAttempts))
                    .build();
        }
    }
}
