package com.hoang.basis.yukihon.base.audit.service;

import com.hoang.basis.yukihon.base.annotation.AuditEnabled;
import com.hoang.basis.yukihon.base.audit.entity.AuditLog;
import com.hoang.basis.yukihon.base.audit.repository.AuditLogRepository;
import com.hoang.basis.yukihon.base.event.EntityChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/** Persists audit entries asynchronously so logging never blocks the request path. */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Async
    @Transactional
    public void record(EntityChangedEvent event) {
        AuditEnabled auditEnabled = event.entityClass().getAnnotation(AuditEnabled.class);
        if (auditEnabled == null) {
            return;
        }
        try {
            auditLogRepository.save(AuditLog.builder()
                    .entityType(event.entityType())
                    .entityId(event.entityId())
                    .action(event.type().name())
                    .actor(event.actor())
                    .snapshot(auditEnabled.trackDiff() ? event.snapshotJson() : null)
                    .createdAt(Instant.now())
                    .build());
        } catch (Exception e) {
            log.warn("Failed to write audit log for {} {}", event.entityType(), event.entityId(), e);
        }
    }
}
