package com.hoang.basis.yukihon.system.learningpath.service;

import com.hoang.basis.yukihon.system.learningpath.dto.LearningPathDto;
import com.hoang.basis.yukihon.system.learningpath.dto.LearningPathLessonDto;
import com.hoang.basis.yukihon.system.lesson.entity.Lesson;
import com.hoang.basis.yukihon.system.lesson.repository.LessonRepository;
import com.hoang.basis.yukihon.system.userlearningstats.entity.UserLearningStats;
import com.hoang.basis.yukihon.system.userlearningstats.repository.UserLearningStatsRepository;
import com.hoang.basis.yukihon.system.userprogress.entity.UserProgress;
import com.hoang.basis.yukihon.system.userprogress.repository.UserProgressRepository;
import com.hoang.basis.yukihon.system.usersettings.dto.UserSettingsDto;
import com.hoang.basis.yukihon.system.usersettings.service.UserSettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class LearningPathService {

    private static final List<String> JLPT_ORDER = List.of("N5", "N4", "N3", "N2", "N1");
    private static final int DEFAULT_DAILY_GOAL_MINUTES = 15;
    private static final String DEFAULT_TARGET_LEVEL = "N5";

    private final LessonRepository lessonRepository;
    private final UserProgressRepository userProgressRepository;
    private final UserLearningStatsRepository userLearningStatsRepository;
    private final UserSettingsService userSettingsService;

    public LearningPathDto getLearningPath(Long userId) {
        UserSettingsDto settings = userSettingsService.getSettings(userId);
        Optional<UserLearningStats> statsOptional = userLearningStatsRepository.findByUserId(userId);
        Map<Long, UserProgress> progressByLessonId = userProgressRepository.findByUserId(userId).stream()
                .filter(progress -> progress.getLessonId() != null)
                .collect(Collectors.toMap(UserProgress::getLessonId, progress -> progress, (left, right) -> right));

        String targetLevel = resolveTargetLevel(settings, statsOptional.orElse(null));
        int dailyGoalMinutes = settings.getDailyGoalMinutes() > 0
                ? settings.getDailyGoalMinutes()
                : DEFAULT_DAILY_GOAL_MINUTES;

        List<Lesson> publishedLessons = lessonRepository.findPublishedLessons();
        List<Lesson> trackLessons = selectTrackLessons(publishedLessons, targetLevel);

        long completedLessonsInTrack = trackLessons.stream()
                .filter(lesson -> isCompleted(progressByLessonId.get(lesson.getId())))
                .count();

        long inProgressLessons = trackLessons.stream()
                .filter(lesson -> isInProgress(progressByLessonId.get(lesson.getId())))
                .count();

        List<LearningPathLessonDto> recommendedLessons = buildRecommendedLessons(
                trackLessons,
                publishedLessons,
                progressByLessonId,
                targetLevel,
                dailyGoalMinutes
        );

        LearningPathLessonDto nextLesson = recommendedLessons.isEmpty() ? null : recommendedLessons.get(0);
        int completionRate = trackLessons.isEmpty()
                ? 0
                : (int) Math.round((completedLessonsInTrack * 100.0) / trackLessons.size());

        UserLearningStats stats = statsOptional.orElse(null);

        return LearningPathDto.builder()
                .targetJlptLevel(targetLevel)
                .dailyGoalMinutes(dailyGoalMinutes)
                .totalLessonsInTrack(trackLessons.size())
                .completedLessonsInTrack((int) completedLessonsInTrack)
                .inProgressLessons((int) inProgressLessons)
                .completionRate(completionRate)
                .currentStreak(stats != null && stats.getCurrentStreak() != null ? stats.getCurrentStreak() : 0)
                .totalXP(stats != null && stats.getTotalXP() != null ? stats.getTotalXP() : 0)
                .nextLesson(nextLesson)
                .recommendedLessons(recommendedLessons)
                .todayGoals(buildTodayGoals(nextLesson, dailyGoalMinutes, targetLevel, inProgressLessons))
                .recommendationSummary(buildRecommendationSummary(nextLesson, completionRate, targetLevel))
                .build();
    }

    private List<LearningPathLessonDto> buildRecommendedLessons(
            List<Lesson> trackLessons,
            List<Lesson> publishedLessons,
            Map<Long, UserProgress> progressByLessonId,
            String targetLevel,
            int dailyGoalMinutes
    ) {
        LinkedHashMap<Long, LearningPathLessonDto> recommended = new LinkedHashMap<>();

        List<Lesson> inProgressLessons = trackLessons.stream()
                .filter(lesson -> isInProgress(progressByLessonId.get(lesson.getId())))
                .sorted(trackComparator())
                .toList();
        addRecommendations(recommended, inProgressLessons, progressByLessonId, targetLevel, dailyGoalMinutes, 1);

        List<Lesson> nextTrackLessons = trackLessons.stream()
                .filter(lesson -> !isCompleted(progressByLessonId.get(lesson.getId())))
                .sorted(trackComparator())
                .toList();
        addRecommendations(recommended, nextTrackLessons, progressByLessonId, targetLevel, dailyGoalMinutes, 3);

        if (recommended.size() < 3) {
            List<Lesson> fallbackLessons = publishedLessons.stream()
                    .filter(lesson -> !isCompleted(progressByLessonId.get(lesson.getId())))
                    .sorted(lessonComparator(targetLevel))
                    .toList();
            addRecommendations(recommended, fallbackLessons, progressByLessonId, targetLevel, dailyGoalMinutes, 3);
        }

        return new ArrayList<>(recommended.values()).stream()
                .limit(3)
                .toList();
    }

    private void addRecommendations(
            LinkedHashMap<Long, LearningPathLessonDto> recommended,
            Collection<Lesson> lessons,
            Map<Long, UserProgress> progressByLessonId,
            String targetLevel,
            int dailyGoalMinutes,
            int limit
    ) {
        for (Lesson lesson : lessons) {
            if (recommended.size() >= limit) {
                return;
            }

            UserProgress progress = progressByLessonId.get(lesson.getId());
            recommended.putIfAbsent(
                    lesson.getId(),
                    toLessonDto(lesson, progress, targetLevel, dailyGoalMinutes)
            );
        }
    }

    private List<Lesson> selectTrackLessons(List<Lesson> publishedLessons, String targetLevel) {
        List<Lesson> matchingTrack = publishedLessons.stream()
                .filter(lesson -> isInTrack(lesson.getJlptLevel(), targetLevel))
                .sorted(trackComparator())
                .toList();

        if (!matchingTrack.isEmpty()) {
            return matchingTrack;
        }

        return publishedLessons.stream()
                .sorted(lessonComparator(targetLevel))
                .limit(12)
                .toList();
    }

    private LearningPathLessonDto toLessonDto(
            Lesson lesson,
            UserProgress progress,
            String targetLevel,
            int dailyGoalMinutes
    ) {
        return LearningPathLessonDto.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .description(lesson.getDescription())
                .jlptLevel(normalizeJlptLevel(lesson.getJlptLevel()))
                .category(lesson.getCategory())
                .orderIndex(lesson.getOrderIndex())
                .progressStatus(progress != null ? progress.getStatus().name() : UserProgress.ProgressStatus.NOT_STARTED.name())
                .progressPercent(resolveProgressPercent(progress))
                .estimatedMinutes(estimateMinutes(lesson, dailyGoalMinutes))
                .recommendationReason(buildRecommendationReason(lesson, progress, targetLevel))
                .build();
    }

    private List<String> buildTodayGoals(
            LearningPathLessonDto nextLesson,
            int dailyGoalMinutes,
            String targetLevel,
            long inProgressLessons
    ) {
        List<String> goals = new ArrayList<>();

        if (nextLesson != null) {
            goals.add("Hoàn thành hoặc tiếp tục bài \"" + nextLesson.getTitle() + "\"");
        }

        goals.add("Dành ít nhất " + dailyGoalMinutes + " phút cho mục tiêu " + targetLevel);

        if (inProgressLessons > 1) {
            goals.add("Chốt bớt bài đang học dở để giữ nhịp học ổn định");
        } else {
            goals.add("Ưu tiên 1 bài chính rồi mới mở bài mới để đỡ bị phân tán");
        }

        return goals;
    }

    private String buildRecommendationSummary(
            LearningPathLessonDto nextLesson,
            int completionRate,
            String targetLevel
    ) {
        if (nextLesson == null) {
            return "Chưa có bài phù hợp trong lộ trình hiện tại. Bạn có thể thêm lesson xuất bản để hệ thống gợi ý chính xác hơn.";
        }

        if ("IN_PROGRESS".equals(nextLesson.getProgressStatus())) {
            return "Bạn đang có đà học tốt. Mình ưu tiên đưa bài đang học dở lên đầu để giữ mạch tập trung.";
        }

        if (completionRate >= 70) {
            return "Bạn đã đi khá sâu trong lộ trình " + targetLevel + ". Gợi ý hiện tại thiên về các bài sát mục tiêu hơn.";
        }

        return "Lộ trình đang ưu tiên các bài nền và bài sát mục tiêu " + targetLevel + " để bạn tiến đều, không bị hụt kiến thức.";
    }

    private String buildRecommendationReason(Lesson lesson, UserProgress progress, String targetLevel) {
        if (isInProgress(progress)) {
            return "Bạn đang học dở bài này, nên hoàn thành trước để giữ mạch học.";
        }

        String lessonLevel = normalizeJlptLevel(lesson.getJlptLevel());
        if (jlptRank(lessonLevel) < jlptRank(targetLevel)) {
            return "Bài này củng cố nền tảng trước khi lên " + targetLevel + ".";
        }

        if (Objects.equals(lessonLevel, targetLevel)) {
            return "Bài này bám đúng mục tiêu JLPT hiện tại của bạn.";
        }

        return "Bài này là lựa chọn phù hợp tiếp theo trong lộ trình cá nhân hóa.";
    }

    private boolean isInTrack(String lessonLevel, String targetLevel) {
        return jlptRank(normalizeJlptLevel(lessonLevel)) <= jlptRank(targetLevel);
    }

    private Comparator<Lesson> lessonComparator(String targetLevel) {
        return Comparator
                .comparingInt((Lesson lesson) -> levelDistance(normalizeJlptLevel(lesson.getJlptLevel()), targetLevel))
                .thenComparingInt(lesson -> jlptRank(normalizeJlptLevel(lesson.getJlptLevel())))
                .thenComparingInt(lesson -> lesson.getOrderIndex() != null ? lesson.getOrderIndex() : 0)
                .thenComparing(lesson -> lesson.getCreatedAt() != null ? lesson.getCreatedAt() : java.time.Instant.EPOCH);
    }

    private Comparator<Lesson> trackComparator() {
        return Comparator
                .comparingInt((Lesson lesson) -> jlptRank(normalizeJlptLevel(lesson.getJlptLevel())))
                .thenComparingInt(lesson -> lesson.getOrderIndex() != null ? lesson.getOrderIndex() : 0)
                .thenComparing(lesson -> lesson.getCreatedAt() != null ? lesson.getCreatedAt() : java.time.Instant.EPOCH);
    }

    private int levelDistance(String lessonLevel, String targetLevel) {
        return Math.abs(jlptRank(lessonLevel) - jlptRank(targetLevel));
    }

    private String resolveTargetLevel(UserSettingsDto settings, UserLearningStats stats) {
        if (settings != null && settings.getTargetJlptLevel() != null && !settings.getTargetJlptLevel().isBlank()) {
            return normalizeJlptLevel(settings.getTargetJlptLevel());
        }

        if (stats != null && stats.getTargetJLPTLevel() != null && !stats.getTargetJLPTLevel().isBlank()) {
            return normalizeJlptLevel(stats.getTargetJLPTLevel());
        }

        return DEFAULT_TARGET_LEVEL;
    }

    private String normalizeJlptLevel(String level) {
        if (level == null || level.isBlank()) {
            return DEFAULT_TARGET_LEVEL;
        }

        String normalized = level.trim().toUpperCase(Locale.ROOT);
        return JLPT_ORDER.contains(normalized) ? normalized : DEFAULT_TARGET_LEVEL;
    }

    private int jlptRank(String level) {
        int index = JLPT_ORDER.indexOf(level);
        return index >= 0 ? index + 1 : 1;
    }

    private boolean isCompleted(UserProgress progress) {
        return progress != null && progress.getStatus() == UserProgress.ProgressStatus.COMPLETED;
    }

    private boolean isInProgress(UserProgress progress) {
        return progress != null && progress.getStatus() == UserProgress.ProgressStatus.IN_PROGRESS;
    }

    private int resolveProgressPercent(UserProgress progress) {
        if (progress == null) {
            return 0;
        }

        if (progress.getStatus() == UserProgress.ProgressStatus.COMPLETED) {
            return 100;
        }

        if (progress.getScore() != null && progress.getTotalScore() != null && progress.getTotalScore() > 0) {
            double rawPercent = (progress.getScore() * 100.0) / progress.getTotalScore();
            return Math.max(0, Math.min(100, (int) Math.round(rawPercent)));
        }

        if (progress.getStatus() == UserProgress.ProgressStatus.IN_PROGRESS) {
            return 55;
        }

        return 0;
    }

    private int estimateMinutes(Lesson lesson, int dailyGoalMinutes) {
        int estimated = 12;
        int contentLength = lesson.getContent() != null ? lesson.getContent().length() : 0;

        if (contentLength > 5000) {
            estimated += 8;
        } else if (contentLength > 2000) {
            estimated += 4;
        }

        if (lesson.getAudioUrl() != null || lesson.getVideoUrl() != null) {
            estimated += 3;
        }

        if ("LISTENING".equalsIgnoreCase(lesson.getCategory()) || "KANJI".equalsIgnoreCase(lesson.getCategory())) {
            estimated += 2;
        }

        return Math.max(10, Math.min(Math.max(dailyGoalMinutes, 10), estimated));
    }
}
