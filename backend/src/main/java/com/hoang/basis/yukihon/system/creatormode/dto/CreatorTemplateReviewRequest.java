package com.hoang.basis.yukihon.system.creatormode.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatorTemplateReviewRequest {

    @NotBlank(message = "Decision is required")
    private String decision;

    private String reviewNote;
}
