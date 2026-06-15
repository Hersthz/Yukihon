package com.hoang.basis.yukihon.base.audit.repository;

import com.hoang.basis.yukihon.base.audit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByEntityTypeOrderByIdDesc(String entityType, Pageable pageable);

    Page<AuditLog> findAllByOrderByIdDesc(Pageable pageable);
}
