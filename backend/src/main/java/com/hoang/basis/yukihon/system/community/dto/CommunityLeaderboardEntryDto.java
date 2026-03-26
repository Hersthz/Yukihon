package com.hoang.basis.yukihon.system.community.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityLeaderboardEntryDto {
    private Long userId;
    private String userDisplayName;
    private long postsCount;
    private long commentsCount;
    private long likesReceived;
    private long score;
}
