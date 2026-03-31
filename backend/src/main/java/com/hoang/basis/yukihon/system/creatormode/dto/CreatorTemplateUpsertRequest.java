package com.hoang.basis.yukihon.system.creatormode.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatorTemplateUpsertRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String summary;

    @NotBlank(message = "Content type is required")
    private String contentType;

    @NotBlank(message = "JLPT level is required")
    private String jlptLevel;

    private String tags;

    @Min(value = 3, message = "Estimated minutes must be at least 3")
    @Max(value = 120, message = "Estimated minutes must not exceed 120")
    private Integer estimatedMinutes;

    @NotBlank(message = "Builder JSON is required")
    private String builderJson;
}
