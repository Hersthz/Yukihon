package com.hoang.basis.yukihon.system.creatormode.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatorTemplateMetricsRequest {

    @Min(value = 1, message = "Attempts must be at least 1")
    private Integer attempts;

    @Min(value = 0, message = "Completions cannot be negative")
    private Integer completions;

    @DecimalMin(value = "0.0", message = "Average score must be >= 0")
    @DecimalMax(value = "100.0", message = "Average score must be <= 100")
    private Double averageScore;
}
