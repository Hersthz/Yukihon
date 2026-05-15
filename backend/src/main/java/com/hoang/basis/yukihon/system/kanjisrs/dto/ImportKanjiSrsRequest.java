package com.hoang.basis.yukihon.system.kanjisrs.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportKanjiSrsRequest {

    @Valid
    @NotNull(message = "Records are required")
    private List<Item> records;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {

        private String character;
        private Integer intervalDays;
        private Double easeFactor;
        private Integer repetitionCount;
        private Integer reviewCount;
        private Instant lastReviewedAt;
        private Instant nextReviewAt;
    }
}
