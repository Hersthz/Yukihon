package com.hoang.basis.yukihon.system.srs.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** Sent when the user rates a card. */
@Data
public class AnkiReviewRequest {

    @NotNull
    private Long deckId;

    @NotNull
    private Long flashcardId;

    /** AGAIN | HARD | GOOD | EASY */
    @NotNull
    private String rating;

    private Double score;

    private Integer timeTakenMs;

    /** ANKI_REVIEW (default) | GAME | ... */
    private String sourceType;
}
