package com.hoang.basis.yukihon.system.mistakedna.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MistakeDnaDto {
    private String summary;
    private String confidence;
    private Integer overallRiskScore;
    private Integer averageQuizAccuracy;
    private Integer dueReviews;
    private Integer inProgressLessons;
    private String dominantPatternTitle;
    private String dominantPatternDescription;
    private List<String> nextMoves;
    private List<String> studySignals;
    private List<MistakePatternDto> patterns;
}
