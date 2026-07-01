package com.hoang.basis.yukihon.system.srs.entity;

import com.hoang.basis.yukihon.base.crud.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * SM-2 / FSRS learning state for one (user, deck, flashcard). {@code nextReviewAt} drives the queue.
 * SM-2 uses easeFactor/intervalDays; FSRS fields (difficulty/stability/...) are reserved for the
 * future FSRS scheduler.
 */
@Entity
@Table(
        name = "anki_srs_progress",
        uniqueConstraints =
                @UniqueConstraint(
                        name = "uk_anki_progress",
                        columnNames = {"user_id", "deck_id", "flashcard_id", "side"}),
        indexes = {
            @Index(name = "idx_anki_progress_due", columnList = "user_id, next_review_at"),
            @Index(name = "idx_anki_progress_flashcard", columnList = "flashcard_id")
        })
@Getter
@Setter
@NoArgsConstructor
public class AnkiSrsProgress extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "deck_id", nullable = false)
    private Long deckId;

    @Column(name = "flashcard_id", nullable = false)
    private Long flashcardId;

    /** Which generated card this progress tracks: FORWARD (front→back) or REVERSE (back→front). */
    @Column(name = "side", nullable = false, length = 10)
    private String side = "FORWARD";

    @Column(name = "state", nullable = false, length = 30)
    private String state = "NEW"; // NEW, LEARNING, REVIEW, RELEARNING

    @Column(name = "memory_score", nullable = false)
    private Double memoryScore = 0.0;

    // --- SM-2 ---
    @Column(name = "ease_factor", nullable = false)
    private Double easeFactor = 2.5;

    @Column(name = "interval_days", nullable = false)
    private Integer intervalDays = 0;

    @Column(name = "review_count", nullable = false)
    private Integer reviewCount = 0;

    @Column(name = "learning_step_index", nullable = false)
    private Integer learningStepIndex = 0;

    @Column(name = "lapses", nullable = false)
    private Integer lapses = 0;

    @Column(name = "last_rating", length = 20)
    private String lastRating; // AGAIN, HARD, GOOD, EASY

    // --- FSRS (reserved) ---
    @Column(name = "algorithm_type", length = 20)
    private String algorithmType = "SM2";

    @Column(name = "difficulty")
    private Double difficulty;

    @Column(name = "stability")
    private Double stability;

    @Column(name = "retrievability")
    private Double retrievability;

    @Column(name = "is_leech", nullable = false)
    private Boolean isLeech = false;

    @Column(name = "suspended", nullable = false)
    private Boolean suspended = false;

    @Column(name = "first_learned_at")
    private LocalDateTime firstLearnedAt;

    @Column(name = "last_reviewed_at")
    private LocalDateTime lastReviewedAt;

    @Column(name = "next_review_at")
    private LocalDateTime nextReviewAt;
}
