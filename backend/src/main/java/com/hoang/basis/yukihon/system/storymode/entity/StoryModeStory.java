package com.hoang.basis.yukihon.system.storymode.entity;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;

@Entity
@Table(
        name = "story_mode_stories",
        uniqueConstraints = @UniqueConstraint(name = "uk_story_mode_story_key", columnNames = "story_key"),
        indexes = {
            @Index(name = "idx_story_mode_published", columnList = "published"),
            @Index(name = "idx_story_mode_jlpt", columnList = "jlpt_level")
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoryModeStory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "story_key", nullable = false, length = 120)
    private String storyKey;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 300)
    private String subtitle;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "jlpt_level", nullable = false, length = 20)
    private String jlptLevel;

    @Column(nullable = false)
    private Integer estimatedMinutes;

    @Column(length = 80)
    private String tone;

    @Column(length = 100)
    private String coverLabel;

    @Column(nullable = false, length = 120)
    private String entrySegmentId;

    @Builder.Default
    @Column(nullable = false)
    private boolean published = false;

    @Column(name = "content_json", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String contentJson;

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
