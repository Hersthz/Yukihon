package com.hoang.basis.yukihon.system.community.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityChatTypingEventDto {

    private String roomId;
    private Long userId;
    private String userDisplayName;
    private boolean typing;
    private Instant createdAt;
}
