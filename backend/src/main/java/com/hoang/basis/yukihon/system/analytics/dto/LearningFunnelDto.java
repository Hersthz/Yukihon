package com.hoang.basis.yukihon.system.analytics.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class LearningFunnelDto {
    private int windowDays;
    private String contentType;
    private Long totalStarted;
    private Long totalCompleted;
    private Long totalAbandoned;
    private Long totalQuizWrong;
    private Long totalQuizCorrected;
    private BigDecimal overallCompletionRate;
    private BigDecimal overallAbandonmentRate;
    private BigDecimal overallQuizRecoveryRate;
    private List<LearningFunnelItemDto> topRetainedContent;
    private List<LearningFunnelItemDto> contentBreakdown;
}
