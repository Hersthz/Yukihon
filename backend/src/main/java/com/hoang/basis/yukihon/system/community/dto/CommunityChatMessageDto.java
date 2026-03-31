package com.hoang.basis.yukihon.system.community.dto;

import com.hoang.basis.yukihon.system.community.entity.CommunityChatMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityChatMessageDto {

    private Long id;
    private String roomId;
    private Long userId;
    private String userDisplayName;
    private String content;
    private Instant createdAt;

    public static CommunityChatMessageDto fromEntity(CommunityChatMessage message) {
        return CommunityChatMessageDto.builder()
                .id(message.getId())
                .roomId(message.getRoomId())
                .userId(message.getUser().getId())
                .userDisplayName(message.getUser().getDisplayName())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
