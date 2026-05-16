package com.hoang.basis.yukihon.system.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizCohortAccuracyDto {
    private String dimension;
    private String value;
    private long totalAttempts;
    private long correctAttempts;
    private double accuracyRate;
}
