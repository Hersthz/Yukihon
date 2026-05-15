package com.hoang.basis.yukihon.system.kanjisrs.service;

import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.kanjisrs.dto.AddKanjiSrsRequest;
import com.hoang.basis.yukihon.system.kanjisrs.dto.ImportKanjiSrsRequest;
import com.hoang.basis.yukihon.system.kanjisrs.dto.KanjiSrsDashboardDto;
import com.hoang.basis.yukihon.system.kanjisrs.dto.KanjiSrsDto;
import com.hoang.basis.yukihon.system.kanjisrs.dto.KanjiSrsRetentionPointDto;
import com.hoang.basis.yukihon.system.kanjisrs.dto.KanjiSrsWeakKanjiDto;
import com.hoang.basis.yukihon.system.kanjisrs.dto.ReviewKanjiSrsRequest;
import com.hoang.basis.yukihon.system.kanjisrs.entity.KanjiSrsRecord;
import com.hoang.basis.yukihon.system.kanjisrs.entity.KanjiSrsReviewEvent;
import com.hoang.basis.yukihon.system.kanjisrs.repository.KanjiSrsRecordRepository;
import com.hoang.basis.yukihon.system.kanjisrs.repository.KanjiSrsReviewEventRepository;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class KanjiSrsService {

    private final KanjiSrsRecordRepository kanjiSrsRecordRepository;
    private final KanjiSrsReviewEventRepository kanjiSrsReviewEventRepository;
    private final UserRepository userRepository;

    public List<KanjiSrsDto> getRecords(Long userId) {
        return kanjiSrsRecordRepository.findByUserIdOrderByNextReviewAtAscCreatedAtDesc(userId).stream()
                .map(KanjiSrsDto::fromEntity)
                .collect(Collectors.toList());
    }

    public KanjiSrsDashboardDto getDashboard(Long userId) {
        List<KanjiSrsRecord> records = kanjiSrsRecordRepository.findByUserIdOrderByNextReviewAtAscCreatedAtDesc(userId);
        ZoneId zoneId = ZoneId.systemDefault();
        LocalDate today = LocalDate.now(zoneId);
        Instant now = Instant.now();
        Instant endOfToday = today.plusDays(1).atStartOfDay(zoneId).toInstant();
        Instant trendStart = today.minusDays(13).atStartOfDay(zoneId).toInstant();
        Instant trendEnd = today.plusDays(1).atStartOfDay(zoneId).toInstant();
        List<KanjiSrsReviewEvent> recentEvents =
                kanjiSrsReviewEventRepository.findByUserIdAndReviewedAtBetweenOrderByReviewedAtAsc(userId, trendStart, trendEnd);

        int dueTodayCount = (int) records.stream()
                .filter(record -> record.getNextReviewAt() == null || !record.getNextReviewAt().isAfter(endOfToday))
                .count();
        int overdueCount = (int) records.stream()
                .filter(record -> record.getNextReviewAt() == null || !record.getNextReviewAt().isAfter(now))
                .count();
        int masteredCount = (int) records.stream()
                .filter(this::isMastered)
                .count();
        List<KanjiSrsWeakKanjiDto> weakKanji = records.stream()
                .filter(this::isWeak)
                .sorted(Comparator
                        .comparing((KanjiSrsRecord record) -> record.getEaseFactor() != null ? record.getEaseFactor() : 2.5)
                        .thenComparing(record -> record.getIntervalDays() != null ? record.getIntervalDays() : 0)
                        .thenComparing(Comparator.comparing((KanjiSrsRecord record) -> record.getReviewCount() != null ? record.getReviewCount() : 0).reversed()))
                .limit(8)
                .map(this::toWeakKanjiDto)
                .toList();

        int totalReviews = recentEvents.stream().mapToInt(event -> 1).sum();
        int retainedReviews = (int) recentEvents.stream().filter(KanjiSrsReviewEvent::isSuccessful).count();
        int fallbackReviews = records.stream()
                .mapToInt(record -> record.getReviewCount() != null ? record.getReviewCount() : 0)
                .sum();
        double retentionRate = totalReviews > 0
                ? percentage(retainedReviews, totalReviews)
                : estimateRetentionFromRecords(records);

        return KanjiSrsDashboardDto.builder()
                .deckCount(records.size())
                .dueTodayCount(dueTodayCount)
                .overdueCount(overdueCount)
                .masteredCount(masteredCount)
                .learningCount(Math.max(0, records.size() - masteredCount))
                .weakCount(weakKanji.size())
                .reviewStreakDays(calculateReviewStreak(recentEvents, records, zoneId, today))
                .totalReviews(totalReviews > 0 ? totalReviews : fallbackReviews)
                .retentionRate(retentionRate)
                .weakKanji(weakKanji)
                .retentionTrend(buildRetentionTrend(recentEvents, zoneId, today))
                .build();
    }

    @Transactional
    public KanjiSrsDto addRecord(Long userId, AddKanjiSrsRequest request) {
        String character = normalizeCharacter(request.getCharacter());
        KanjiSrsRecord existing = kanjiSrsRecordRepository.findByUserIdAndCharacter(userId, character)
                .orElse(null);
        if (existing != null) {
            return KanjiSrsDto.fromEntity(existing);
        }

        User user = findUserByIdOrThrow(userId);
        KanjiSrsRecord record = KanjiSrsRecord.builder()
                .user(user)
                .character(character)
                .intervalDays(0)
                .easeFactor(2.5)
                .repetitionCount(0)
                .reviewCount(0)
                .nextReviewAt(Instant.now())
                .build();

        KanjiSrsRecord saved = kanjiSrsRecordRepository.save(record);
        log.info("User {} added kanji {} to SRS", userId, character);
        return KanjiSrsDto.fromEntity(saved);
    }

    @Transactional
    public List<KanjiSrsDto> importRecords(Long userId, ImportKanjiSrsRequest request) {
        User user = findUserByIdOrThrow(userId);

        if (request.getRecords() == null || request.getRecords().isEmpty()) {
            return getRecords(userId);
        }

        request.getRecords().stream()
                .filter(item -> item.getCharacter() != null && !item.getCharacter().isBlank())
                .forEach(item -> {
                    String character = normalizeCharacter(item.getCharacter());
                    if (kanjiSrsRecordRepository.existsByUserIdAndCharacter(userId, character)) {
                        return;
                    }

                    KanjiSrsRecord record = KanjiSrsRecord.builder()
                            .user(user)
                            .character(character)
                            .intervalDays(Math.max(0, item.getIntervalDays() != null ? item.getIntervalDays() : 0))
                            .easeFactor(Math.max(1.3, item.getEaseFactor() != null ? item.getEaseFactor() : 2.5))
                            .repetitionCount(Math.max(0, item.getRepetitionCount() != null ? item.getRepetitionCount() : 0))
                            .reviewCount(Math.max(0, item.getReviewCount() != null ? item.getReviewCount() : 0))
                            .lastReviewedAt(item.getLastReviewedAt())
                            .nextReviewAt(item.getNextReviewAt() != null ? item.getNextReviewAt() : Instant.now())
                            .build();
                    kanjiSrsRecordRepository.save(record);
                });

        return getRecords(userId);
    }

    @Transactional
    public KanjiSrsDto reviewRecord(Long userId, String rawCharacter, ReviewKanjiSrsRequest request) {
        KanjiSrsRecord record = findOwnedRecordOrThrow(userId, rawCharacter);
        ReviewRating rating = ReviewRating.from(request.getRating());
        Instant now = Instant.now();

        double easeFactor = record.getEaseFactor() != null ? record.getEaseFactor() : 2.5;
        int intervalDays = record.getIntervalDays() != null ? record.getIntervalDays() : 0;
        int repetitionCount = record.getRepetitionCount() != null ? record.getRepetitionCount() : 0;

        switch (rating) {
            case AGAIN -> {
                repetitionCount = 0;
                intervalDays = 1;
                easeFactor = Math.max(1.3, easeFactor - 0.2);
            }
            case HARD -> {
                repetitionCount = Math.max(1, repetitionCount);
                intervalDays = Math.max(1, intervalDays <= 1 ? 2 : (int) Math.round(intervalDays * 1.2));
                easeFactor = Math.max(1.3, easeFactor - 0.15);
            }
            case GOOD -> {
                repetitionCount += 1;
                if (repetitionCount <= 1) {
                    intervalDays = 1;
                } else if (repetitionCount == 2) {
                    intervalDays = 3;
                } else {
                    intervalDays = Math.max(4, (int) Math.round(intervalDays * easeFactor));
                }
            }
            case EASY -> {
                repetitionCount += 1;
                if (repetitionCount <= 1) {
                    intervalDays = 2;
                } else if (repetitionCount == 2) {
                    intervalDays = 5;
                } else {
                    intervalDays = Math.max(6, (int) Math.round(intervalDays * (easeFactor + 0.25)));
                }
                easeFactor += 0.15;
            }
        }

        record.setEaseFactor(easeFactor);
        record.setIntervalDays(intervalDays);
        record.setRepetitionCount(repetitionCount);
        record.setReviewCount((record.getReviewCount() != null ? record.getReviewCount() : 0) + 1);
        record.setLastReviewedAt(now);
        record.setNextReviewAt(now.plusSeconds(intervalDays * 24L * 60L * 60L));
        KanjiSrsRecord saved = kanjiSrsRecordRepository.save(record);
        kanjiSrsReviewEventRepository.save(KanjiSrsReviewEvent.builder()
                .user(saved.getUser())
                .character(saved.getCharacter())
                .rating(rating.name())
                .successful(rating != ReviewRating.AGAIN)
                .intervalAfterDays(intervalDays)
                .easeAfter(easeFactor)
                .reviewedAt(now)
                .build());
        return KanjiSrsDto.fromEntity(saved);
    }

    @Transactional
    public void removeRecord(Long userId, String rawCharacter) {
        KanjiSrsRecord record = findOwnedRecordOrThrow(userId, rawCharacter);
        kanjiSrsRecordRepository.delete(record);
        log.info("User {} removed kanji {} from SRS", userId, record.getCharacter());
    }

    private User findUserByIdOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private KanjiSrsRecord findOwnedRecordOrThrow(Long userId, String rawCharacter) {
        String character = normalizeCharacter(rawCharacter);
        return kanjiSrsRecordRepository.findByUserIdAndCharacter(userId, character)
                .orElseThrow(() -> new ResourceNotFoundException("Kanji SRS record not found"));
    }

    private String normalizeCharacter(String character) {
        return character == null ? "" : character.trim();
    }

    private boolean isMastered(KanjiSrsRecord record) {
        int intervalDays = record.getIntervalDays() != null ? record.getIntervalDays() : 0;
        int repetitionCount = record.getRepetitionCount() != null ? record.getRepetitionCount() : 0;
        return intervalDays >= 21 || repetitionCount >= 5;
    }

    private boolean isWeak(KanjiSrsRecord record) {
        double easeFactor = record.getEaseFactor() != null ? record.getEaseFactor() : 2.5;
        int intervalDays = record.getIntervalDays() != null ? record.getIntervalDays() : 0;
        int repetitionCount = record.getRepetitionCount() != null ? record.getRepetitionCount() : 0;
        int reviewCount = record.getReviewCount() != null ? record.getReviewCount() : 0;
        return reviewCount >= 2 && (easeFactor <= 2.0 || repetitionCount <= 1 || intervalDays <= 1);
    }

    private KanjiSrsWeakKanjiDto toWeakKanjiDto(KanjiSrsRecord record) {
        double easeFactor = record.getEaseFactor() != null ? record.getEaseFactor() : 2.5;
        int intervalDays = record.getIntervalDays() != null ? record.getIntervalDays() : 0;
        int repetitionCount = record.getRepetitionCount() != null ? record.getRepetitionCount() : 0;
        int reviewCount = record.getReviewCount() != null ? record.getReviewCount() : 0;

        String reason;
        if (easeFactor <= 2.0) {
            reason = "Ease thấp";
        } else if (repetitionCount <= 1) {
            reason = "Lặp lại chưa ổn định";
        } else {
            reason = "Interval còn ngắn";
        }

        return KanjiSrsWeakKanjiDto.builder()
                .character(record.getCharacter())
                .intervalDays(intervalDays)
                .easeFactor(easeFactor)
                .repetitionCount(repetitionCount)
                .reviewCount(reviewCount)
                .nextReviewAt(record.getNextReviewAt())
                .reason(reason)
                .build();
    }

    private List<KanjiSrsRetentionPointDto> buildRetentionTrend(List<KanjiSrsReviewEvent> events, ZoneId zoneId, LocalDate today) {
        Map<LocalDate, List<KanjiSrsReviewEvent>> eventsByDate = events.stream()
                .collect(Collectors.groupingBy(event -> event.getReviewedAt().atZone(zoneId).toLocalDate()));

        return java.util.stream.IntStream.rangeClosed(0, 13)
                .mapToObj(offset -> {
                    LocalDate date = today.minusDays(13L - offset);
                    List<KanjiSrsReviewEvent> dayEvents = eventsByDate.getOrDefault(date, List.of());
                    int reviewCount = dayEvents.size();
                    int retainedCount = (int) dayEvents.stream().filter(KanjiSrsReviewEvent::isSuccessful).count();
                    int forgottenCount = reviewCount - retainedCount;
                    return KanjiSrsRetentionPointDto.builder()
                            .date(date.toString())
                            .reviewCount(reviewCount)
                            .retainedCount(retainedCount)
                            .forgottenCount(forgottenCount)
                            .retentionRate(reviewCount > 0 ? percentage(retainedCount, reviewCount) : 0)
                            .build();
                })
                .toList();
    }

    private int calculateReviewStreak(List<KanjiSrsReviewEvent> events, List<KanjiSrsRecord> records, ZoneId zoneId, LocalDate today) {
        Set<LocalDate> reviewedDates = events.stream()
                .map(event -> event.getReviewedAt().atZone(zoneId).toLocalDate())
                .collect(Collectors.toSet());

        if (reviewedDates.isEmpty()) {
            return records.stream()
                    .map(KanjiSrsRecord::getLastReviewedAt)
                    .filter(lastReviewedAt -> lastReviewedAt != null)
                    .map(lastReviewedAt -> lastReviewedAt.atZone(zoneId).toLocalDate())
                    .anyMatch(date -> date.equals(today) || date.equals(today.minusDays(1))) ? 1 : 0;
        }

        LocalDate cursor = reviewedDates.contains(today) ? today : today.minusDays(1);
        int streak = 0;
        while (reviewedDates.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private double estimateRetentionFromRecords(List<KanjiSrsRecord> records) {
        int totalReviews = records.stream()
                .mapToInt(record -> record.getReviewCount() != null ? record.getReviewCount() : 0)
                .sum();
        if (totalReviews == 0) {
            return 0;
        }

        int stableReviews = records.stream()
                .mapToInt(record -> {
                    int reviewCount = record.getReviewCount() != null ? record.getReviewCount() : 0;
                    double easeFactor = record.getEaseFactor() != null ? record.getEaseFactor() : 2.5;
                    return easeFactor >= 2.3 ? reviewCount : Math.max(0, reviewCount - 1);
                })
                .sum();
        return percentage(stableReviews, totalReviews);
    }

    private double percentage(int value, int total) {
        if (total <= 0) {
            return 0;
        }
        return Math.round((value * 1000.0) / total) / 10.0;
    }

    private enum ReviewRating {
        AGAIN,
        HARD,
        GOOD,
        EASY;

        private static ReviewRating from(String value) {
            return ReviewRating.valueOf(value.trim().toUpperCase(Locale.ROOT));
        }
    }
}
