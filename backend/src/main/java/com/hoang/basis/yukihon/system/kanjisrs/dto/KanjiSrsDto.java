package com.hoang.basis.yukihon.system.kanjisrs.dto;

import com.hoang.basis.yukihon.system.kanjisrs.entity.KanjiSrsRecord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KanjiSrsDto {

    private Long id;
    private String character;
    private Integer intervalDays;
    private Double easeFactor;
    private Integer repetitionCount;
    private Integer reviewCount;
    private Instant lastReviewedAt;
    private Instant nextReviewAt;
    private boolean dueForReview;
    private boolean mastered;
    private Instant createdAt;
    private Instant updatedAt;

    public static KanjiSrsDto fromEntity(KanjiSrsRecord record) {
        Instant nextReviewAt = record.getNextReviewAt();
        int intervalDays = record.getIntervalDays() != null ? record.getIntervalDays() : 0;
        int repetitionCount = record.getRepetitionCount() != null ? record.getRepetitionCount() : 0;

        return KanjiSrsDto.builder()
                .id(record.getId())
                .character(record.getCharacter())
                .intervalDays(intervalDays)
                .easeFactor(record.getEaseFactor())
                .repetitionCount(repetitionCount)
                .reviewCount(record.getReviewCount())
                .lastReviewedAt(record.getLastReviewedAt())
                .nextReviewAt(nextReviewAt)
                .dueForReview(nextReviewAt == null || !nextReviewAt.isAfter(Instant.now()))
                .mastered(intervalDays >= 21 || repetitionCount >= 5)
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }
}
