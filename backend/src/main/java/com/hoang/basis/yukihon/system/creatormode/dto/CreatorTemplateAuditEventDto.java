package com.hoang.basis.yukihon.system.creatormode.dto;

import com.hoang.basis.yukihon.system.creatormode.entity.CreatorTemplateAuditEvent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatorTemplateAuditEventDto {

    private Long id;
    private Long templateId;
    private Long actorUserId;
    private String actorDisplayName;
    private String stage;
    private String action;
    private String decision;
    private String note;
    private String createdAt;

    public static CreatorTemplateAuditEventDto fromEntity(CreatorTemplateAuditEvent entity) {
        return CreatorTemplateAuditEventDto.builder()
                .id(entity.getId())
                .templateId(entity.getTemplateId())
                .actorUserId(entity.getActorUserId())
                .actorDisplayName(entity.getActor() != null ? entity.getActor().getDisplayName() : null)
                .stage(entity.getStage().name())
                .action(entity.getAction().name())
                .decision(entity.getDecision())
                .note(entity.getNote())
                .createdAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null)
                .build();
    }
}
