package com.hoang.basis.yukihon.system.lesson.entity;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;

@Entity
@Table(name = "lesson_versions", indexes = @Index(name = "idx_lesson_versions_lesson_id", columnList = "lesson_id"))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lesson_id", nullable = false)
    private Long lessonId;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(name = "change_action", nullable = false, length = 30)
    private String changeAction;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @Column(length = 5)
    private String jlptLevel;

    @Column(length = 100)
    private String category;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(name = "order_index")
    private Integer orderIndex;

    @Column(columnDefinition = "TEXT")
    private String audioUrl;

    @Column(columnDefinition = "TEXT")
    private String videoUrl;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String relatedVocabularyIds;

    @Column(columnDefinition = "TEXT")
    private String relatedGrammarIds;

    @Column(columnDefinition = "TEXT")
    private String relatedQuizIds;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
