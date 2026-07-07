package com.hoang.basis.yukihon.system.quizletstudy.entity;

import com.hoang.basis.yukihon.base.crud.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One Quizlet-style (non-SRS) study session over a deck: a single run of Learn/Match/Flashcard.
 * Holds the running tally; individual answers are logged in {@link QuizletStudyLog}. Like the rest
 * of the Quizlet layer, this NEVER touches {@code anki_srs_progress}.
 */
@Entity
@Table(
        name = "quizlet_study_sessions",
        indexes = @Index(name = "idx_quizlet_session_deck", columnList = "user_id, deck_id"))
@Getter
@Setter
@NoArgsConstructor
public class QuizletStudySession extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "deck_id", nullable = false)
    private Long deckId;

    @Column(name = "mode", nullable = false, length = 20)
    private String mode = "LEARN"; // FLASHCARD, LEARN, MATCH

    @Column(name = "status", nullable = false, length = 20)
    private String status = "IN_PROGRESS"; // IN_PROGRESS, COMPLETED

    @Column(name = "total_answered", nullable = false)
    private Integer totalAnswered = 0;

    @Column(name = "correct_count", nullable = false)
    private Integer correctCount = 0;

    @Column(name = "wrong_count", nullable = false)
    private Integer wrongCount = 0;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;
}
