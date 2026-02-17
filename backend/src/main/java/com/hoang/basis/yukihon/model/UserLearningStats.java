package com.hoang.basis.yukihon.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

/**
 * UserLearningStats entity to track user's learning statistics and streaks
 */
@Entity
@Table(name = "user_learning_stats",
        uniqueConstraints = @UniqueConstraint(name = "uk_user_stats", columnNames = "user_id"),
        indexes = @Index(name = "idx_user_learning_stats_user_id", columnList = "user_id"))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLearningStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "user_id", insertable = false, updatable = false)
    private Long userId;

    @Column(nullable = false)
    @Builder.Default
    private Integer totalXP = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer currentStreak = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer longestStreak = 0;

    @Column
    private LocalDate lastLearningDate;

    @Column(nullable = false)
    @Builder.Default
    private Integer lessonsCompleted = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer quizzesCompleted = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer vocabularyLearned = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer grammarLearned = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer totalLearningMinutes = 0;

    @Column(length = 5)
    private String targetJLPTLevel; // N5, N4, N3, N2, N1

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
