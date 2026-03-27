package com.hoang.basis.yukihon.system.admin.service;

import com.hoang.basis.yukihon.system.admin.dto.ContentLevelBreakdownDto;
import com.hoang.basis.yukihon.system.admin.dto.ContentOverviewDto;
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
import java.util.Set;
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

        user.setRoles(roles);
        User updated = userRepository.save(user);
        
        log.info("Successfully updated roles for user {}", userId);
        return UserManagementDto.fromEntity(updated);
    }

    /**
     * Update user enabled/disabled status
     */
    @Transactional
    public UserManagementDto updateUserStatus(Long userId, UpdateUserStatusRequest request) {
        log.info("Updating status for user {}: enabled={}", userId, request.getEnabled());
        
        User user = findUserByIdOrThrow(userId);

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
}
