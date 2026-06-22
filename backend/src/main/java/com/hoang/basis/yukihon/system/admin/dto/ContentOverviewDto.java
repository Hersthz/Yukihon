package com.hoang.basis.yukihon.system.admin.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentOverviewDto {
    private long totalLessons;
    private long publishedLessons;
    private long draftLessons;
    private long reviewLessons;
    private long archivedLessons;
    private long totalVocabulary;
    private long totalGrammar;
    private long totalQuizzes;
    private long totalContentItems;
    private List<ContentLevelBreakdownDto> levelBreakdown;
}
