package com.hoang.basis.yukihon.system.quizattempt.entity;

import com.hoang.basis.yukihon.system.quiz.entity.Quiz;
import com.hoang.basis.yukihon.system.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "quiz_attempts",
        indexes = {
                @Index(name = "idx_quiz_attempts_user_attempted", columnList = "user_id, attempted_at"),
                @Index(name = "idx_quiz_attempts_user_quiz", columnList = "user_id, quiz_id"),
                @Index(name = "idx_quiz_attempts_pattern", columnList = "mistake_pattern")
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "user_id", insertable = false, updatable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "quiz_id", insertable = false, updatable = false)
    private Long quizId;

    @Column(name = "submitted_answer", nullable = false, columnDefinition = "TEXT")
    private String answer;

    @Column(nullable = false)
    private boolean correct;

    @Column(nullable = false)
    private Integer score;

    @Column(name = "mistake_pattern", length = 40)
    private String mistakePattern;

    @Column(nullable = false, updatable = false)
    private Instant attemptedAt;

    @PrePersist
    public void prePersist() {
        if (attemptedAt == null) {
            attemptedAt = Instant.now();
        }
    }
}
