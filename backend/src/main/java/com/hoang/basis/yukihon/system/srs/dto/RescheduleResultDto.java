package com.hoang.basis.yukihon.system.srs.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Outcome of a history-replay reschedule: replays every review log through the deck's current
 * scheduler to rebuild each card's state/interval. In dryRun mode nothing is persisted — the
 * {@code changes} list previews what would change.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescheduleResultDto {
    private String algorithmType; // SM2 | FSRS
    private boolean dryRun;
    private int cardsProcessed;
    private int cardsChanged;
    private int cardsSkippedNoHistory;
    private List<Change> changes; // capped preview of per-card diffs

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Change {
        private Long flashcardId;
        private String side;
        private String oldState;
        private String newState;
        private Integer oldIntervalDays;
        private Integer newIntervalDays;
        private LocalDateTime oldNextReviewAt;
        private LocalDateTime newNextReviewAt;
    }
}
