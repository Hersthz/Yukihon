package com.hoang.basis.yukihon.system.quizletstudy.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** One answer event logged against an open session. */
@Data
public class SessionAnswerRequest {

    @NotNull
    private Long flashcardId;

    @NotNull
    private Boolean correct;

    /** Optional: what the learner typed (Learn mode). */
    private String answer;
}
