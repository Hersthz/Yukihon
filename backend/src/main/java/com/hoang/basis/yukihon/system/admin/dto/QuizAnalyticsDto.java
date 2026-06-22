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
public class QuizAnalyticsDto {
    private long totalAttempts;
    private long correctAttempts;
    private long wrongAttempts;
    private double overallAccuracy;
    private String mostCommonPattern;
    private List<QuizQuestionAnalyticsDto> mostMissedQuestions;
    private List<QuizPatternAnalyticsDto> patternBreakdown;
    private List<QuizCohortAccuracyDto> cohortAccuracy;
}
