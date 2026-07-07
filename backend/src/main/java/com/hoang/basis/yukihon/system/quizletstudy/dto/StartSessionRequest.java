package com.hoang.basis.yukihon.system.quizletstudy.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** Start a Quizlet study session over a deck. */
@Data
public class StartSessionRequest {

    @NotNull
    private Long deckId;

    /** FLASHCARD | LEARN | MATCH (defaults to LEARN if blank). */
    private String mode;
}
