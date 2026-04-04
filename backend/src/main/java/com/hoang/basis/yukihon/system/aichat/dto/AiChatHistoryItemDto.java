package com.hoang.basis.yukihon.system.aichat.dto;

import com.hoang.basis.yukihon.system.aichat.entity.AiChatMessage;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class AiChatHistoryItemDto {
    private final Long id;
    private final String role;
    private final String text;
    private final String mode;
    private final String model;
    private final Instant createdAt;

    public static AiChatHistoryItemDto fromEntity(AiChatMessage message) {
        return AiChatHistoryItemDto.builder()
                .id(message.getId())
                .role(message.getRole())
                .text(message.getText())
                .mode(message.getMode())
                .model(message.getModel())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
