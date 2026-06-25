package com.hoang.basis.yukihon.system.srs.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Per-(user, deck) SRS preferences for the settings screen. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnkiSrsSettingDto {
    private Long algorithmConfigId;
    private String algorithmType; // SM2 | FSRS (resolved from preset, display only)
    private Double targetRetention;
    private Integer maxReviewsPerDay;
    private Integer maxItemsPerDay;
    private Integer maximumIntervalDays;
    private Boolean suspendLeeches;
    private Integer leechThreshold;
}
