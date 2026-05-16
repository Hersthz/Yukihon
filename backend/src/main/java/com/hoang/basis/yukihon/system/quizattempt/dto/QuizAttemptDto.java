package com.hoang.basis.yukihon.system.quizattempt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttemptDto {
    private Long id;
    private Long userId;
    private Long quizId;
    private String answer;
    private Boolean correct;
    private Integer score;
    private String mistakePattern;
    private String attemptedAt;
}
