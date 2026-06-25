package com.hoang.basis.yukihon.system.srs.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Deck-level SRS analytics: state counts, today/forecast load, and ease/interval distributions. */
@Data
@Builder
public class AnkiStatsDto {

    private long totalCards;
    private long newCards;
    private long learningCards;
    private long relearningCards;
    private long reviewCards;
    private long suspendedCards;
    private long leechCards;

    private long studiedToday;
    private long dueToday;
    private long dueTomorrow;

    private double avgMemoryScore;
    private double avgEaseFactor;
    private double avgIntervalDays;
    private long totalReviews;
    private long totalLapses;

    /** Next 14 days: how many reviews fall due each day. */
    private List<Bucket> futureReviews;

    /** Distribution of cards by interval length. */
    private List<Bucket> intervalBuckets;

    /** Distribution of REVIEW cards by ease factor. */
    private List<Bucket> easeBuckets;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Bucket {
        private String label;
        private long count;
    }
}
