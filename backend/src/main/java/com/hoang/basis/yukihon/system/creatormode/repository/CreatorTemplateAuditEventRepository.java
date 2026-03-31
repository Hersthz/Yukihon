package com.hoang.basis.yukihon.system.creatormode.repository;

import com.hoang.basis.yukihon.system.creatormode.entity.CreatorTemplateAuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CreatorTemplateAuditEventRepository extends JpaRepository<CreatorTemplateAuditEvent, Long> {

    List<CreatorTemplateAuditEvent> findByTemplateIdOrderByCreatedAtAscIdAsc(Long templateId);

    List<CreatorTemplateAuditEvent> findByTemplateIdAndStageOrderByCreatedAtAscIdAsc(
        Long templateId,
        CreatorTemplateAuditEvent.AuditStage stage
    );

    List<CreatorTemplateAuditEvent> findByTemplateIdAndActorUserIdOrderByCreatedAtAscIdAsc(
        Long templateId,
        Long actorUserId
    );

    List<CreatorTemplateAuditEvent> findByTemplateIdAndActorUserIdIsNullOrderByCreatedAtAscIdAsc(Long templateId);

    List<CreatorTemplateAuditEvent> findByTemplateIdAndStageAndActorUserIdOrderByCreatedAtAscIdAsc(
        Long templateId,
        CreatorTemplateAuditEvent.AuditStage stage,
        Long actorUserId
    );

    List<CreatorTemplateAuditEvent> findByTemplateIdAndStageAndActorUserIdIsNullOrderByCreatedAtAscIdAsc(
        Long templateId,
        CreatorTemplateAuditEvent.AuditStage stage
    );
}