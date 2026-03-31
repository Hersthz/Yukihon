package com.hoang.basis.yukihon.system.analytics.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "learning_analytics_events",
        indexes = {
                @Index(name = "idx_learning_analytics_events_event_created", columnList = "event_type, created_at"),
                @Index(name = "idx_learning_analytics_events_content_created", columnList = "content_type, content_id, created_at"),
                @Index(name = "idx_learning_analytics_events_user_created", columnList = "user_id, created_at")
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningAnalyticsEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "session_id", length = 120)
    private String sessionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 60)
    private EventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false, length = 30)
    private ContentType contentType;

    @Column(name = "content_id", nullable = false)
    private Long contentId;

    @Column(name = "jlpt_level", length = 5)
    private String jlptLevel;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "score")
    private Integer score;

    @Column(name = "metadata_json", columnDefinition = "NVARCHAR(MAX)")
    private String metadataJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }

    public enum EventType {
        START_LEARNING,
        COMPLETE_LESSON,
        ABANDON_LESSON,
        QUIZ_WRONG,
        QUIZ_CORRECT_AFTER_REVIEW
    }

    public enum ContentType {
        LESSON,
        QUIZ,
        STORY,
        COURSE
    }
}
