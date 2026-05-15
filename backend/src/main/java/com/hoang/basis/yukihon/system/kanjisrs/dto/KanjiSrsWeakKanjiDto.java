package com.hoang.basis.yukihon.system.kanjisrs.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KanjiSrsWeakKanjiDto {

    private String character;
    private int intervalDays;
    private double easeFactor;
    private int repetitionCount;
    private int reviewCount;
    private Instant nextReviewAt;
    private String reason;
}
