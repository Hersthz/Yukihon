package com.hoang.basis.yukihon.base.audit.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Append-only audit trail row written for {@code @AuditEnabled} entities on each CRUD change. */
@Entity
@Table(
        name = "audit_logs",
        indexes = {
            @Index(name = "idx_audit_entity", columnList = "entity_type,entity_id"),
            @Index(name = "idx_audit_created", columnList = "created_at")
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entity_type", nullable = false, length = 100)
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "action", nullable = false, length = 20)
    private String action;

    @Column(name = "actor", length = 255)
    private String actor;

    @Column(name = "snapshot", columnDefinition = "NVARCHAR(MAX)")
    private String snapshot;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
