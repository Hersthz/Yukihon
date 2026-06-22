package com.hoang.basis.yukihon.system.community.dto;

import com.hoang.basis.yukihon.system.community.entity.CommunityChatMessage;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityChatMessageDto {

    private Long id;
    private String roomId;
    private Long userId;
    private String userDisplayName;
    private String clientMessageId;
    private String content;
    private Instant createdAt;

    public static CommunityChatMessageDto fromEntity(CommunityChatMessage message) {
        return fromEntity(message, null);
    }

    public static CommunityChatMessageDto fromEntity(CommunityChatMessage message, String clientMessageId) {
        return CommunityChatMessageDto.builder()
                .id(message.getId())
                .roomId(message.getRoomId())
                .userId(message.getUser().getId())
                .userDisplayName(message.getUser().getDisplayName())
                .clientMessageId(clientMessageId)
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
