package com.hoang.basis.yukihon.system.analytics.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class LearningFunnelDailyPointDto {
    private String date;
    private Long startedCount;
    private Long completedCount;
    private Long abandonedCount;
    private Long quizWrongCount;
    private Long quizCorrectedCount;
    private BigDecimal completionRate;
    private BigDecimal abandonmentRate;
    private BigDecimal quizRecoveryRate;
    private BigDecimal retentionScore;
}
