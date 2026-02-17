package com.hoang.basis.yukihon.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * UserProgress entity to track user's learning progress
 */
@Entity
@Table(name = "user_progress",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_lesson", columnNames = {"user_id", "lesson_id"}),
                @UniqueConstraint(name = "uk_user_quiz", columnNames = {"user_id", "quiz_id"})
        },
        indexes = {
                @Index(name = "idx_user_progress_user_id", columnList = "user_id"),
                @Index(name = "idx_user_progress_status", columnList = "status")
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "user_id", insertable = false, updatable = false)
    private Long userId;

    @Column(name = "lesson_id")
    private Long lessonId;

    @Column(name = "quiz_id")
    private Long quizId;

    @Column(name = "vocabulary_id")
    private Long vocabularyId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ProgressStatus status; // NOT_STARTED, IN_PROGRESS, COMPLETED

    @Column(length = 100)
    private String progressType; // lesson, quiz, vocabulary

    @Column
    private Integer score;

    @Column
    private Integer totalScore;

    @Column
    private Integer attemptCount;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @Column
    private Instant completedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (status == null) {
            status = ProgressStatus.NOT_STARTED;
        }
        if (attemptCount == null) {
            attemptCount = 0;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    public enum ProgressStatus {
        NOT_STARTED,
        IN_PROGRESS,
        COMPLETED
    }
}
