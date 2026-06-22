package com.hoang.basis.yukihon.system.quizsession.entity;

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
import java.math.BigDecimal;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "quiz_sessions",
        indexes = {
            @Index(name = "idx_quiz_sessions_user_completed", columnList = "user_id, completed_at"),
            @Index(name = "idx_quiz_sessions_mode", columnList = "mode"),
            @Index(name = "idx_quiz_sessions_weakest_pattern", columnList = "weakest_pattern")
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "user_id", insertable = false, updatable = false)
    private Long userId;

    @Column(nullable = false, length = 40)
    private String mode;

    @Column(nullable = false)
    private Integer totalQuestions;

    @Column(nullable = false)
    private Integer correctCount;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal accuracyRate;

    @Column(length = 40)
    private String weakestPattern;

    @Column(nullable = false, updatable = false)
    private Instant startedAt;

    @Column(nullable = false, updatable = false)
    private Instant completedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        if (startedAt == null) {
            startedAt = now;
        }
        if (completedAt == null) {
            completedAt = now;
        }
    }
}
