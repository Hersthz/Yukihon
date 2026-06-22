package com.hoang.basis.yukihon.system.community.dto;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
