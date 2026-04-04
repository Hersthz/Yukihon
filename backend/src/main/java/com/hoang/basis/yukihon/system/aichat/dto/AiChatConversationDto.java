package com.hoang.basis.yukihon.system.aichat.dto;

import com.hoang.basis.yukihon.system.aichat.entity.AiChatConversation;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class AiChatConversationDto {
    private final Long id;
    private final String title;
    private final Instant createdAt;
    private final Instant updatedAt;

    public static AiChatConversationDto fromEntity(AiChatConversation conversation) {
        return AiChatConversationDto.builder()
                .id(conversation.getId())
                .title(conversation.getTitle())
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .build();
    }
}
