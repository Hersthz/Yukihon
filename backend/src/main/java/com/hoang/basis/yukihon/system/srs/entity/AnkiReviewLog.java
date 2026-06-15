package com.hoang.basis.yukihon.system.srs.entity;

import com.hoang.basis.yukihon.base.crud.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Append-only log of every review. Stores old/new values for debugging, stats, and future FSRS
 * reschedule replay. sourceType distinguishes ANKI_REVIEW vs GAME (Kana game) vs others.
 */
@Entity
@Table(name = "anki_review_logs", indexes = {
        @Index(name = "idx_anki_log_user", columnList = "user_id"),
        @Index(name = "idx_anki_log_progress", columnList = "progress_id"),
        @Index(name = "idx_anki_log_reviewed", columnList = "reviewed_at")
})
@Getter
@Setter
@NoArgsConstructor
public class AnkiReviewLog extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "progress_id", nullable = false)
    private Long progressId;

    @Column(name = "deck_id", nullable = false)
    private Long deckId;

    @Column(name = "flashcard_id", nullable = false)
    private Long flashcardId;

    @Column(name = "rating", nullable = false, length = 20)
    private String rating;

    @Column(name = "score")
    private Double score;

    @Column(name = "time_taken_ms")
    private Integer timeTakenMs;

    @Column(name = "reviewed_at", nullable = false)
    private LocalDateTime reviewedAt;

    @Column(name = "old_ease_factor")
    private Double oldEaseFactor;

    @Column(name = "new_ease_factor")
    private Double newEaseFactor;

    @Column(name = "old_interval_days")
    private Integer oldIntervalDays;

    @Column(name = "new_interval_days")
    private Integer newIntervalDays;

    @Column(name = "old_state", length = 30)
    private String oldState;

    @Column(name = "new_state", length = 30)
    private String newState;

    @Column(name = "old_lapses")
    private Integer oldLapses;

    @Column(name = "new_lapses")
    private Integer newLapses;

    @Column(name = "source_type", nullable = false, length = 30)
    private String sourceType = "ANKI_REVIEW";

    @Column(name = "source_id")
    private Long sourceId;
}
