package com.hoang.basis.yukihon.system.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionAnalyticsDto {
    private Long quizId;
    private String title;
    private String jlptLevel;
    private String difficultyLevel;
    private String quizType;
    private long totalAttempts;
    private long wrongAttempts;
    private double accuracyRate;
    private String topPattern;
}
