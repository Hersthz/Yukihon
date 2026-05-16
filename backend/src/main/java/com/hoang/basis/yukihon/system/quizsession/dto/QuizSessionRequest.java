package com.hoang.basis.yukihon.system.quizsession.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizSessionRequest {

    @NotBlank(message = "Mode is required")
    private String mode;

    @NotNull(message = "Total questions is required")
    @Min(value = 1, message = "Total questions must be positive")
    @Max(value = 200, message = "Total questions is too large")
    private Integer totalQuestions;

    @NotNull(message = "Correct count is required")
    @Min(value = 0, message = "Correct count cannot be negative")
    @Max(value = 200, message = "Correct count is too large")
    private Integer correctCount;

    private String weakestPattern;
}
