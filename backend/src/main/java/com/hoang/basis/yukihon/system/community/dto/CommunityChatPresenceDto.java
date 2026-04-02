package com.hoang.basis.yukihon.system.community.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityChatPresenceDto {

    private String roomId;
    private int activeUsers;
    private List<String> activeDisplayNames;
    private Instant createdAt;
}
