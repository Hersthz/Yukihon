package com.hoang.basis.yukihon.system.kanjisrs.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KanjiSrsDashboardDto {

    private int deckCount;
    private int dueTodayCount;
    private int overdueCount;
    private int masteredCount;
    private int learningCount;
    private int weakCount;
    private int reviewStreakDays;
    private int totalReviews;
    private double retentionRate;
    private List<KanjiSrsWeakKanjiDto> weakKanji;
    private List<KanjiSrsRetentionPointDto> retentionTrend;
}
