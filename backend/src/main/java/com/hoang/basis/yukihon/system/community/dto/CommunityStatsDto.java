package com.hoang.basis.yukihon.system.community.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityStatsDto {
    private long totalPosts;
    private long totalComments;
    private long totalContributors;
    private long postsThisWeek;
    private long questionsCount;
    private long resourcesCount;
    private List<String> trendingTags;
}
