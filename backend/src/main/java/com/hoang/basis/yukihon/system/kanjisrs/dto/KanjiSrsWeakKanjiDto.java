package com.hoang.basis.yukihon.system.kanjisrs.dto;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
