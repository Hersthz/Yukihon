package com.hoang.basis.yukihon.system.community.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
