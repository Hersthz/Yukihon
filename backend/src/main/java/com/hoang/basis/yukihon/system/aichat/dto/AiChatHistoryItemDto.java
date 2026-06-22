package com.hoang.basis.yukihon.system.aichat.dto;

import com.hoang.basis.yukihon.system.aichat.entity.AiChatMessage;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AiChatHistoryItemDto {
    private final Long id;
    private final Long conversationId;
    private final String role;
    private final String text;
    private final String mode;
    private final String model;
    private final Instant createdAt;

    public static AiChatHistoryItemDto fromEntity(AiChatMessage message) {
        return AiChatHistoryItemDto.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .role(message.getRole())
                .text(message.getText())
                .mode(message.getMode())
                .model(message.getModel())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
