package com.hoang.basis.yukihon.base.audit.web;

import com.hoang.basis.yukihon.base.audit.entity.AuditLog;
import com.hoang.basis.yukihon.base.audit.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Read-only admin view of the audit trail. */
@RestController
@RequestMapping("/api/audits")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Page<AuditLog> list(@RequestParam(required = false) String entityType, Pageable pageable) {
        if (entityType != null && !entityType.isBlank()) {
            return auditLogRepository.findByEntityTypeOrderByIdDesc(entityType, pageable);
        }
        return auditLogRepository.findAllByOrderByIdDesc(pageable);
    }
}
