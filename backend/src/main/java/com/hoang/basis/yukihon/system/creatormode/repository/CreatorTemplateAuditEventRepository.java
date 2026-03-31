package com.hoang.basis.yukihon.system.creatormode.repository;

import com.hoang.basis.yukihon.system.creatormode.entity.CreatorTemplateAuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CreatorTemplateAuditEventRepository extends JpaRepository<CreatorTemplateAuditEvent, Long> {

    List<CreatorTemplateAuditEvent> findByTemplateIdOrderByCreatedAtAscIdAsc(Long templateId);
}