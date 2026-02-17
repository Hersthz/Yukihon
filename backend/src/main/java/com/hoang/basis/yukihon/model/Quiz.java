package com.hoang.basis.yukihon.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Quiz entity for assessments and practice
 */
@Entity
@Table(name = "quizzes",
        indexes = {
                @Index(name = "idx_quiz_level", columnList = "difficulty_level"),
                @Index(name = "idx_quiz_type", columnList = "quiz_type")
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private QuizType quizType; // MULTIPLE_CHOICE, FILL_IN_BLANK, MATCHING, LISTENING, etc.

    @Column(length = 100)
    private String difficultyLevel; // BEGINNER, INTERMEDIATE, ADVANCED

    @Column(length = 5)
    private String jlptLevel; // N1, N2, N3, N4, N5

    @Column(columnDefinition = "TEXT")
    private String question;

    @Column(columnDefinition = "LONGTEXT")
    private String options; // JSON format for quiz options

    @Column(columnDefinition = "TEXT")
    private String correctAnswer;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(columnDefinition = "TEXT")
    private String audioUrl;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

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

    public enum QuizType {
        MULTIPLE_CHOICE,
        FILL_IN_BLANK,
        MATCHING,
        LISTENING,
        WRITING,
        TRANSLATION
    }
}
