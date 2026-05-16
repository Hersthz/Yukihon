package com.hoang.basis.yukihon.system.quizattempt.dto;

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
public class QuizAttemptRequest {

    @NotNull(message = "Quiz id is required")
    private Long quizId;

    @NotBlank(message = "Answer is required")
    private String answer;
}
