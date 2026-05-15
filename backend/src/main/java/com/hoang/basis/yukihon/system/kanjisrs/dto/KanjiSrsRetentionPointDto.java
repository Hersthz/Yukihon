package com.hoang.basis.yukihon.system.kanjisrs.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KanjiSrsRetentionPointDto {

    private String date;
    private int reviewCount;
    private int retainedCount;
    private int forgottenCount;
    private double retentionRate;
}
