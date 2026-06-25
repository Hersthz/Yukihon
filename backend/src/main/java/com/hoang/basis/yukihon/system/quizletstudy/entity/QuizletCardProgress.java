package com.hoang.basis.yukihon.system.quizletstudy.entity;

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
 * Non-SRS (Quizlet-style) study progress for one (user, deck, flashcard). Completely separate from
 * {@code anki_srs_progress}: studying here NEVER changes SRS due dates, intervals, or ease.
 */
@Entity
@Table(
        name = "quizlet_card_progress",
        uniqueConstraints =
                @UniqueConstraint(
                        name = "uk_quizlet_progress",
                        columnNames = {"user_id", "deck_id", "flashcard_id"}),
        indexes = @Index(name = "idx_quizlet_progress_deck", columnList = "user_id, deck_id"))
@Getter
@Setter
@NoArgsConstructor
public class QuizletCardProgress extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "deck_id", nullable = false)
    private Long deckId;

    @Column(name = "flashcard_id", nullable = false)
    private Long flashcardId;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "NOT_STUDIED"; // NOT_STUDIED, STUDYING, MASTERED

    @Column(name = "correct_count", nullable = false)
    private Integer correctCount = 0;

    @Column(name = "wrong_count", nullable = false)
    private Integer wrongCount = 0;

    @Column(name = "last_answer_correct")
    private Boolean lastAnswerCorrect;

    @Column(name = "last_studied_at")
    private LocalDateTime lastStudiedAt;
}
