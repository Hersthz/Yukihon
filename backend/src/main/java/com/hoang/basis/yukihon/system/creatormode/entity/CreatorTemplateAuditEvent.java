package com.hoang.basis.yukihon.system.creatormode.entity;

import com.hoang.basis.yukihon.system.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "creator_template_audit_events", indexes = {
        @Index(name = "idx_creator_template_audit_template_created", columnList = "template_id, created_at"),
        @Index(name = "idx_creator_template_audit_actor_created", columnList = "actor_user_id, created_at")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatorTemplateAuditEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private CreatorTemplate template;

    @Column(name = "template_id", insertable = false, updatable = false)
    private Long templateId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_user_id")
    private User actor;

    @Column(name = "actor_user_id", insertable = false, updatable = false)
    private Long actorUserId;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage", nullable = false, length = 40)
    private AuditStage stage;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 60)
    private AuditAction action;

    @Column(name = "decision", length = 30)
    private String decision;

    @Column(name = "note", length = 1000)
    private String note;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }

    public enum AuditStage {
        AUTHORING,
        REVIEW_SUBMISSION,
        REVIEWER_REVIEW,
        ADMIN_APPROVAL
    }

    public enum AuditAction {
        CREATED,
        UPDATED_DRAFT,
        SUBMITTED_FOR_REVIEW,
        REVIEW_DECISION,
        ADMIN_DECISION
    }
}