package com.hoang.basis.yukihon.system.quizletstudy.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Summary of a Quizlet study session (for the live tally and the deck's session history). */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizletSessionDto {
    private Long id;
    private Long deckId;
    private String mode;
    private String status;
    private Integer totalAnswered;
    private Integer correctCount;
    private Integer wrongCount;
    private Integer accuracy; // percent 0..100
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Integer durationSeconds;
}
