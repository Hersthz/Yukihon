package com.hoang.basis.yukihon.system.analytics.dto;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LearningFunnelItemDto {
    private String contentType;
    private Long contentId;
    private String contentTitle;
    private Long startedCount;
    private Long completedCount;
    private Long abandonedCount;
    private Long quizWrongCount;
    private Long quizCorrectedCount;
    private BigDecimal completionRate;
    private BigDecimal abandonmentRate;
    private BigDecimal quizRecoveryRate;
    private BigDecimal retentionScore;
    private String lastEventAt;
}
