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

/** One answer event within a {@link QuizletStudySession} (per-card correct/wrong + typed answer). */
@Entity
@Table(name = "quizlet_study_logs", indexes = @Index(name = "idx_quizlet_log_session", columnList = "session_id"))
@Getter
@Setter
@NoArgsConstructor
public class QuizletStudyLog extends BaseEntity {

    @Column(name = "session_id", nullable = false)
    private Long sessionId;

    @Column(name = "flashcard_id", nullable = false)
    private Long flashcardId;

    @Column(name = "correct", nullable = false)
    private Boolean correct = false;

    @Column(name = "answer", columnDefinition = "LONGTEXT")
    private String answer;

    @Column(name = "answered_at", nullable = false)
    private LocalDateTime answeredAt;
}
