package com.hoang.basis.yukihon.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Lesson entity for comprehensive Japanese lessons
 */
@Entity
@Table(name = "lessons",
        indexes = {
                @Index(name = "idx_lesson_jlpt_level", columnList = "jlpt_level"),
                @Index(name = "idx_lesson_status", columnList = "status")
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @Column(length = 5)
    private String jlptLevel; // N1, N2, N3, N4, N5

    @Column(length = 100)
    private String category; // grammar, vocabulary, kanji, listening, etc.

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private LessonStatus status; // DRAFT, PUBLISHED, ARCHIVED

    @Column(name = "order_index")
    private Integer orderIndex;

    @Column(columnDefinition = "TEXT")
    private String audioUrl;

    @Column(columnDefinition = "TEXT")
    private String videoUrl;

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
        if (orderIndex == null) {
            orderIndex = 0;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    public enum LessonStatus {
        DRAFT,
        PUBLISHED,
        ARCHIVED
    }
}
