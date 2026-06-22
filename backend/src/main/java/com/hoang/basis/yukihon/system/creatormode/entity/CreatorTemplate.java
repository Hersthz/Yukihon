package com.hoang.basis.yukihon.system.creatormode.entity;

import com.hoang.basis.yukihon.system.user.entity.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.*;

@Entity
@Table(
        name = "creator_templates",
        indexes = {
            @Index(name = "idx_creator_templates_status", columnList = "status"),
            @Index(name = "idx_creator_templates_type", columnList = "content_type"),
            @Index(name = "idx_creator_templates_creator", columnList = "created_by_user_id")
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatorTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 500)
    private String summary;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false, length = 30)
    private ContentType contentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TemplateStatus status;

    @Column(name = "jlpt_level", nullable = false, length = 5)
    private String jlptLevel;

    @Column(length = 500)
    private String tags;

    @Column(name = "estimated_minutes", nullable = false)
    private Integer estimatedMinutes;

    @Column(name = "builder_json", nullable = false, columnDefinition = "LONGTEXT")
    private String builderJson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    @Column(name = "created_by_user_id", insertable = false, updatable = false)
    private Long createdByUserId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_user_id")
    private User reviewedBy;

    @Column(name = "reviewed_by_user_id", insertable = false, updatable = false)
    private Long reviewedByUserId;

    @Column(name = "review_note", length = 1000)
    private String reviewNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_reviewed_by_user_id")
    private User adminReviewedBy;

    @Column(name = "admin_reviewed_by_user_id", insertable = false, updatable = false)
    private Long adminReviewedByUserId;

    @Column(name = "admin_review_note", length = 1000)
    private String adminReviewNote;

    @Builder.Default
    @Column(name = "usage_count", nullable = false)
    private Integer usageCount = 0;

    @Builder.Default
    @Column(name = "completion_count", nullable = false)
    private Integer completionCount = 0;

    @Builder.Default
    @Column(name = "average_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal averageScore = BigDecimal.ZERO;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "admin_reviewed_at")
    private Instant adminReviewedAt;

    @Column(name = "last_published_at")
    private Instant lastPublishedAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (status == null) {
            status = TemplateStatus.DRAFT;
        }
        if (estimatedMinutes == null || estimatedMinutes <= 0) {
            estimatedMinutes = 10;
        }
        if (usageCount == null) {
            usageCount = 0;
        }
        if (completionCount == null) {
            completionCount = 0;
        }
        if (averageScore == null) {
            averageScore = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    public enum ContentType {
        MINI_LESSON,
        QUIZ,
        STORY_BRANCH
    }

    public enum TemplateStatus {
        DRAFT,
        PENDING_REVIEW,
        APPROVED,
        REJECTED,
        PUBLISHED
    }
}
