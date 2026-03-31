package com.hoang.basis.yukihon.system.creatormode.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatorTemplateAnalyticsDto {
    private long totalTemplates;
    private long drafts;
    private long pendingReview;
    private long approved;
    private long rejected;
    private long published;

    private long miniLessons;
    private long quizzes;
    private long storyBranches;

    private long totalUsage;
    private long totalCompletions;
    private BigDecimal completionRate;
    private BigDecimal averageScore;

    private List<CreatorTemplateAnalyticsItemDto> topTemplates;
}
