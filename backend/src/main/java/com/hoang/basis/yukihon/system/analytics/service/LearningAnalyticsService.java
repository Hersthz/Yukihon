package com.hoang.basis.yukihon.system.analytics.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoang.basis.yukihon.system.analytics.dto.LearningAnalyticsEventRequest;
import com.hoang.basis.yukihon.system.analytics.dto.LearningFunnelDailyPointDto;
import com.hoang.basis.yukihon.system.analytics.dto.LearningFunnelDto;
import com.hoang.basis.yukihon.system.analytics.dto.LearningFunnelItemDto;
import com.hoang.basis.yukihon.system.analytics.entity.LearningAnalyticsEvent;
import com.hoang.basis.yukihon.system.analytics.repository.LearningAnalyticsEventRepository;
import com.hoang.basis.yukihon.system.analytics.repository.LearningFunnelAggregateProjection;
import com.hoang.basis.yukihon.system.analytics.repository.LearningFunnelDailyTrendProjection;
import com.hoang.basis.yukihon.system.lesson.repository.LessonRepository;
import com.hoang.basis.yukihon.system.quiz.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LearningAnalyticsService {

    private final LearningAnalyticsEventRepository learningAnalyticsEventRepository;
    private final LessonRepository lessonRepository;
    private final QuizRepository quizRepository;
    private final ObjectMapper objectMapper;

    public void trackEvent(Long userId, LearningAnalyticsEventRequest request) {
        LearningAnalyticsEvent event = LearningAnalyticsEvent.builder()
                .userId(userId)
                .sessionId(normalizeSessionId(request.getSessionId()))
                .eventType(parseEventType(request.getEventType()))
                .contentType(parseContentType(request.getContentType()))
                .contentId(request.getContentId())
                .jlptLevel(normalizeJlptLevel(request.getJlptLevel()))
                .durationSeconds(request.getDurationSeconds())
                .score(request.getScore())
                .metadataJson(toMetadataJson(request))
                .build();

        learningAnalyticsEventRepository.save(event);
    }

    @Transactional(readOnly = true)
        public LearningFunnelDto getLearningFunnel(
            int days,
            int limit,
            String contentType,
            String jlptLevel,
            String startDate,
            String endDate
        ) {
        int safeDays = Math.max(1, Math.min(days, 365));
        int safeLimit = Math.max(1, Math.min(limit, 50));

        LearningAnalyticsEvent.ContentType filterType = contentType == null || contentType.isBlank()
                ? LearningAnalyticsEvent.ContentType.LESSON
                : parseContentType(contentType);

        String normalizedJlptLevel = normalizeJlptFilter(jlptLevel);
        DateRangeFilter dateRangeFilter = resolveDateRangeFilter(safeDays, startDate, endDate);

        List<LearningFunnelAggregateProjection> aggregates = learningAnalyticsEventRepository.aggregateFunnel(
            dateRangeFilter.getSince(),
            dateRangeFilter.getUntil(),
                filterType,
            normalizedJlptLevel,
                LearningAnalyticsEvent.EventType.START_LEARNING,
                LearningAnalyticsEvent.EventType.COMPLETE_LESSON,
                LearningAnalyticsEvent.EventType.ABANDON_LESSON,
                LearningAnalyticsEvent.EventType.QUIZ_WRONG,
                LearningAnalyticsEvent.EventType.QUIZ_CORRECT_AFTER_REVIEW
        );

            List<LearningFunnelDailyTrendProjection> dailyAggregates = learningAnalyticsEventRepository.aggregateDailyTrend(
                dateRangeFilter.getSince(),
                dateRangeFilter.getUntil(),
                filterType.name(),
                normalizedJlptLevel,
                LearningAnalyticsEvent.EventType.START_LEARNING.name(),
                LearningAnalyticsEvent.EventType.COMPLETE_LESSON.name(),
                LearningAnalyticsEvent.EventType.ABANDON_LESSON.name(),
                LearningAnalyticsEvent.EventType.QUIZ_WRONG.name(),
                LearningAnalyticsEvent.EventType.QUIZ_CORRECT_AFTER_REVIEW.name()
            );

        Map<String, String> titleByKey = resolveTitles(aggregates);
            List<LearningFunnelDailyPointDto> dailyTrend = buildDailyTrend(dailyAggregates, dateRangeFilter);

        List<LearningFunnelItemDto> breakdown = aggregates.stream()
                .map(item -> toFunnelItem(item, titleByKey))
                .sorted(Comparator
                        .comparing(LearningFunnelItemDto::getRetentionScore, Comparator.reverseOrder())
                        .thenComparing(LearningFunnelItemDto::getStartedCount, Comparator.reverseOrder()))
                .toList();

        long totalStarted = breakdown.stream().mapToLong(item -> safeLong(item.getStartedCount())).sum();
        long totalCompleted = breakdown.stream().mapToLong(item -> safeLong(item.getCompletedCount())).sum();
        long totalAbandoned = breakdown.stream().mapToLong(item -> safeLong(item.getAbandonedCount())).sum();
        long totalQuizWrong = breakdown.stream().mapToLong(item -> safeLong(item.getQuizWrongCount())).sum();
        long totalQuizCorrected = breakdown.stream().mapToLong(item -> safeLong(item.getQuizCorrectedCount())).sum();

        return LearningFunnelDto.builder()
            .windowDays(dateRangeFilter.getWindowDays())
                .contentType(filterType.name())
            .jlptLevel(normalizedJlptLevel)
            .startDate(dateRangeFilter.getStartDate())
            .endDate(dateRangeFilter.getEndDate())
                .totalStarted(totalStarted)
                .totalCompleted(totalCompleted)
                .totalAbandoned(totalAbandoned)
                .totalQuizWrong(totalQuizWrong)
                .totalQuizCorrected(totalQuizCorrected)
                .overallCompletionRate(toPercent(totalCompleted, totalStarted))
                .overallAbandonmentRate(toPercent(totalAbandoned, totalStarted))
                .overallQuizRecoveryRate(toPercent(totalQuizCorrected, totalQuizWrong))
                .dailyTrend(dailyTrend)
                .topRetainedContent(breakdown.stream().limit(safeLimit).toList())
                .contentBreakdown(breakdown)
                .build();
    }

            private List<LearningFunnelDailyPointDto> buildDailyTrend(
                List<LearningFunnelDailyTrendProjection> dailyAggregates,
                DateRangeFilter dateRangeFilter
            ) {
            Map<LocalDate, LearningFunnelDailyTrendProjection> projectionByDate = dailyAggregates.stream()
                .filter(item -> item.getEventDate() != null)
                .collect(Collectors.toMap(
                    item -> item.getEventDate().toLocalDate(),
                    item -> item,
                    (left, right) -> left
                ));

            LocalDate startDate = dateRangeFilter.getEffectiveStartDate();
            LocalDate endDate = dateRangeFilter.getEffectiveEndDate();

            if (startDate == null || endDate == null) {
                return List.of();
            }

            return startDate.datesUntil(endDate.plusDays(1))
                .map(date -> {
                    LearningFunnelDailyTrendProjection projection = projectionByDate.get(date);

                    long started = projection == null ? 0L : safeLong(projection.getStartedCount());
                    long completed = projection == null ? 0L : safeLong(projection.getCompletedCount());
                    long abandoned = projection == null ? 0L : safeLong(projection.getAbandonedCount());
                    long quizWrong = projection == null ? 0L : safeLong(projection.getQuizWrongCount());
                    long quizCorrected = projection == null ? 0L : safeLong(projection.getQuizCorrectedCount());

                    BigDecimal completionRate = toPercent(completed, started);
                    BigDecimal abandonmentRate = toPercent(abandoned, started);
                    BigDecimal quizRecoveryRate = toPercent(quizCorrected, quizWrong);
                    BigDecimal retentionScore = completionRate
                        .subtract(abandonmentRate.multiply(BigDecimal.valueOf(0.60)))
                        .add(quizRecoveryRate.multiply(BigDecimal.valueOf(0.40)))
                        .max(BigDecimal.ZERO)
                        .setScale(2, RoundingMode.HALF_UP);

                    return LearningFunnelDailyPointDto.builder()
                        .date(date.toString())
                        .startedCount(started)
                        .completedCount(completed)
                        .abandonedCount(abandoned)
                        .quizWrongCount(quizWrong)
                        .quizCorrectedCount(quizCorrected)
                        .completionRate(completionRate)
                        .abandonmentRate(abandonmentRate)
                        .quizRecoveryRate(quizRecoveryRate)
                        .retentionScore(retentionScore)
                        .build();
                })
                .toList();
            }

    private LearningFunnelItemDto toFunnelItem(
            LearningFunnelAggregateProjection aggregate,
            Map<String, String> titleByKey
    ) {
        long started = safeLong(aggregate.getStartedCount());
        long completed = safeLong(aggregate.getCompletedCount());
        long abandoned = safeLong(aggregate.getAbandonedCount());
        long quizWrong = safeLong(aggregate.getQuizWrongCount());
        long quizCorrected = safeLong(aggregate.getQuizCorrectedCount());

        BigDecimal completionRate = toPercent(completed, started);
        BigDecimal abandonmentRate = toPercent(abandoned, started);
        BigDecimal quizRecoveryRate = toPercent(quizCorrected, quizWrong);

        BigDecimal retentionScore = completionRate
                .subtract(abandonmentRate.multiply(BigDecimal.valueOf(0.60)))
                .add(quizRecoveryRate.multiply(BigDecimal.valueOf(0.40)))
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);

        String key = buildContentKey(aggregate.getContentType(), aggregate.getContentId());
        String title = titleByKey.getOrDefault(key, fallbackTitle(aggregate.getContentType(), aggregate.getContentId()));

        return LearningFunnelItemDto.builder()
                .contentType(aggregate.getContentType().name())
                .contentId(aggregate.getContentId())
                .contentTitle(title)
                .startedCount(started)
                .completedCount(completed)
                .abandonedCount(abandoned)
                .quizWrongCount(quizWrong)
                .quizCorrectedCount(quizCorrected)
                .completionRate(completionRate)
                .abandonmentRate(abandonmentRate)
                .quizRecoveryRate(quizRecoveryRate)
                .retentionScore(retentionScore)
                .lastEventAt(aggregate.getLastEventAt() != null ? aggregate.getLastEventAt().toString() : null)
                .build();
    }

    private Map<String, String> resolveTitles(List<LearningFunnelAggregateProjection> aggregates) {
        Map<String, String> titleByKey = new HashMap<>();

        Set<Long> lessonIds = aggregates.stream()
                .filter(item -> item.getContentType() == LearningAnalyticsEvent.ContentType.LESSON)
                .map(LearningFunnelAggregateProjection::getContentId)
                .collect(Collectors.toSet());

        if (!lessonIds.isEmpty()) {
            lessonRepository.findAllById(lessonIds)
                    .forEach(lesson -> titleByKey.put(buildContentKey(LearningAnalyticsEvent.ContentType.LESSON, lesson.getId()), lesson.getTitle()));
        }

        Set<Long> quizIds = aggregates.stream()
                .filter(item -> item.getContentType() == LearningAnalyticsEvent.ContentType.QUIZ)
                .map(LearningFunnelAggregateProjection::getContentId)
                .collect(Collectors.toSet());

        if (!quizIds.isEmpty()) {
            quizRepository.findAllById(quizIds)
                    .forEach(quiz -> titleByKey.put(buildContentKey(LearningAnalyticsEvent.ContentType.QUIZ, quiz.getId()), quiz.getTitle()));
        }

        return titleByKey;
    }

    private String toMetadataJson(LearningAnalyticsEventRequest request) {
        if (request.getMetadata() == null || request.getMetadata().isEmpty()) {
            return null;
        }

        try {
            return objectMapper.writeValueAsString(request.getMetadata());
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    private String normalizeSessionId(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return null;
        }
        String trimmed = sessionId.trim();
        return trimmed.length() > 120 ? trimmed.substring(0, 120) : trimmed;
    }

    private String normalizeJlptLevel(String jlptLevel) {
        if (jlptLevel == null || jlptLevel.isBlank()) {
            return null;
        }
        String normalized = jlptLevel.trim().toUpperCase();
        if (normalized.length() > 5) {
            return normalized.substring(0, 5);
        }
        return normalized;
    }

    private String normalizeJlptFilter(String jlptLevel) {
        if (jlptLevel == null || jlptLevel.isBlank()) {
            return null;
        }

        String normalized = jlptLevel.trim().toUpperCase();
        return switch (normalized) {
            case "N5", "N4", "N3", "N2", "N1" -> normalized;
            default -> throw new IllegalArgumentException("Invalid jlptLevel: " + jlptLevel);
        };
    }

    private DateRangeFilter resolveDateRangeFilter(int fallbackDays, String startDate, String endDate) {
        LocalDate parsedStart = parseDate(startDate, "startDate");
        LocalDate parsedEnd = parseDate(endDate, "endDate");

        if (parsedStart == null && parsedEnd == null) {
            LocalDate effectiveEnd = LocalDate.now(ZoneOffset.UTC);
            LocalDate effectiveStart = effectiveEnd.minusDays(fallbackDays - 1L);
            Instant since = effectiveStart.atStartOfDay(ZoneOffset.UTC).toInstant();
            Instant until = effectiveEnd.plusDays(1L).atStartOfDay(ZoneOffset.UTC).toInstant();
            return new DateRangeFilter(since, until, fallbackDays, effectiveStart.toString(), effectiveEnd.toString(), effectiveStart, effectiveEnd);
        }

        LocalDate effectiveStart = parsedStart != null ? parsedStart : parsedEnd;
        LocalDate effectiveEnd = parsedEnd != null ? parsedEnd : parsedStart;

        if (effectiveStart == null || effectiveEnd == null) {
            throw new IllegalArgumentException("Invalid date range");
        }

        if (effectiveEnd.isBefore(effectiveStart)) {
            LocalDate temp = effectiveStart;
            effectiveStart = effectiveEnd;
            effectiveEnd = temp;
        }

        Instant since = effectiveStart.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant until = effectiveEnd.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        int windowDays = (int) ChronoUnit.DAYS.between(effectiveStart, effectiveEnd) + 1;

        return new DateRangeFilter(since, until, windowDays, effectiveStart.toString(), effectiveEnd.toString(), effectiveStart, effectiveEnd);
    }

    private LocalDate parseDate(String rawValue, String fieldName) {
        if (rawValue == null || rawValue.isBlank()) {
            return null;
        }

        try {
            return LocalDate.parse(rawValue.trim());
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid " + fieldName + ": " + rawValue);
        }
    }

    private LearningAnalyticsEvent.EventType parseEventType(String value) {
        try {
            return LearningAnalyticsEvent.EventType.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid eventType: " + value);
        }
    }

    private LearningAnalyticsEvent.ContentType parseContentType(String value) {
        try {
            return LearningAnalyticsEvent.ContentType.valueOf(value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid contentType: " + value);
        }
    }

    private BigDecimal toPercent(long numerator, long denominator) {
        if (denominator <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return BigDecimal.valueOf((numerator * 100.0) / denominator).setScale(2, RoundingMode.HALF_UP);
    }

    private long safeLong(Long value) {
        return value == null ? 0L : value;
    }

    private String buildContentKey(LearningAnalyticsEvent.ContentType contentType, Long contentId) {
        return contentType.name() + ":" + contentId;
    }

    private String fallbackTitle(LearningAnalyticsEvent.ContentType contentType, Long contentId) {
        String prefix = switch (contentType) {
            case LESSON -> "Lesson";
            case QUIZ -> "Quiz";
            case STORY -> "Story";
            case COURSE -> "Course";
        };
        return prefix + " #" + contentId;
    }

    private static final class DateRangeFilter {
        private final Instant since;
        private final Instant until;
        private final int windowDays;
        private final String startDate;
        private final String endDate;
        private final LocalDate effectiveStartDate;
        private final LocalDate effectiveEndDate;

        private DateRangeFilter(
                Instant since,
                Instant until,
                int windowDays,
                String startDate,
                String endDate,
                LocalDate effectiveStartDate,
                LocalDate effectiveEndDate
        ) {
            this.since = since;
            this.until = until;
            this.windowDays = windowDays;
            this.startDate = startDate;
            this.endDate = endDate;
            this.effectiveStartDate = effectiveStartDate;
            this.effectiveEndDate = effectiveEndDate;
        }

        private Instant getSince() {
            return since;
        }

        private Instant getUntil() {
            return until;
        }

        private int getWindowDays() {
            return windowDays;
        }

        private String getStartDate() {
            return startDate;
        }

        private String getEndDate() {
            return endDate;
        }

        private LocalDate getEffectiveStartDate() {
            return effectiveStartDate;
        }

        private LocalDate getEffectiveEndDate() {
            return effectiveEndDate;
        }
    }
}
