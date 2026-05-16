package com.hoang.basis.yukihon.system.quizsession.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizSessionDto {
    private Long id;
    private Long userId;
    private String mode;
    private Integer totalQuestions;
    private Integer correctCount;
    private Double accuracyRate;
    private String weakestPattern;
    private String startedAt;
    private String completedAt;
}
