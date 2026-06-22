package com.hoang.basis.yukihon.system.analytics.dto;

import java.math.BigDecimal;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LearningFunnelDto {
    private int windowDays;
    private String contentType;
    private String jlptLevel;
    private String startDate;
    private String endDate;
    private Long totalStarted;
    private Long totalCompleted;
    private Long totalAbandoned;
    private Long totalQuizWrong;
    private Long totalQuizCorrected;
    private BigDecimal overallCompletionRate;
    private BigDecimal overallAbandonmentRate;
    private BigDecimal overallQuizRecoveryRate;
    private List<LearningFunnelDailyPointDto> dailyTrend;
    private List<LearningFunnelItemDto> topRetainedContent;
    private List<LearningFunnelItemDto> contentBreakdown;
}
