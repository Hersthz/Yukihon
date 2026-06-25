package com.hoang.basis.yukihon.system.quizletstudy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Non-SRS study progress for one flashcard. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizletCardProgressDto {
    private Long flashcardId;
    private String status; // NOT_STUDIED, STUDYING, MASTERED
    private Integer correctCount;
    private Integer wrongCount;
}
