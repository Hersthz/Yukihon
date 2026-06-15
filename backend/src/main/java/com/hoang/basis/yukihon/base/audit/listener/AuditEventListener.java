package com.hoang.basis.yukihon.base.audit.listener;

import com.hoang.basis.yukihon.base.audit.service.AuditLogService;
import com.hoang.basis.yukihon.base.event.EntityChangedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/** Bridges {@link EntityChangedEvent} to the audit log service. */
@Component
@RequiredArgsConstructor
public class AuditEventListener {

    private final AuditLogService auditLogService;

    @EventListener
    public void onEntityChanged(EntityChangedEvent event) {
        auditLogService.record(event);
    }
}
