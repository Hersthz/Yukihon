package com.hoang.basis.yukihon.system.quizletstudy.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** One non-SRS answer event (a card answered correctly or not in Learn/Match mode). */
@Data
public class QuizletAnswerRequest {

    @NotNull
    private Long deckId;

    @NotNull
    private Long flashcardId;

    @NotNull
    private Boolean correct;
}
