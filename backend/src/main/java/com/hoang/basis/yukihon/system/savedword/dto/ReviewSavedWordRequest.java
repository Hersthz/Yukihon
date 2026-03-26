package com.hoang.basis.yukihon.system.savedword.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewSavedWordRequest {

    @NotBlank(message = "Rating is required")
    private String rating;
}
