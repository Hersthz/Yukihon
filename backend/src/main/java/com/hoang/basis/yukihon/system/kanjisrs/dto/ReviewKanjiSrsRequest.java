package com.hoang.basis.yukihon.system.kanjisrs.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewKanjiSrsRequest {

    @NotBlank(message = "Rating is required")
    private String rating;
}
