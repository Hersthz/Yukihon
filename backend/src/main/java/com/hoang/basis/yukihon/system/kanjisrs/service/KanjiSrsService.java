package com.hoang.basis.yukihon.system.kanjisrs.service;

import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.kanjisrs.dto.AddKanjiSrsRequest;
import com.hoang.basis.yukihon.system.kanjisrs.dto.ImportKanjiSrsRequest;
import com.hoang.basis.yukihon.system.kanjisrs.dto.KanjiSrsDto;
import com.hoang.basis.yukihon.system.kanjisrs.dto.ReviewKanjiSrsRequest;
import com.hoang.basis.yukihon.system.kanjisrs.entity.KanjiSrsRecord;
import com.hoang.basis.yukihon.system.kanjisrs.repository.KanjiSrsRecordRepository;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class KanjiSrsService {

    private final KanjiSrsRecordRepository kanjiSrsRecordRepository;
    private final UserRepository userRepository;

    public List<KanjiSrsDto> getRecords(Long userId) {
        return kanjiSrsRecordRepository.findByUserIdOrderByNextReviewAtAscCreatedAtDesc(userId).stream()
                .map(KanjiSrsDto::fromEntity)
                .collect(Collectors.toList());
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
