package com.hoang.basis.yukihon.system.library.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Create a card. `front`/`back` are the summary fields; the rest become rich side content blocks. */
@Data
public class AddCardRequest {

    @NotBlank
    private String front;

    @NotBlank
    private String back;

    private String hint;

    /** FORWARD (default) | FORWARD_REVERSE — study template for the new card. */
    private String template;

    // --- Rich fields (optional) → mapped to FRONT/BACK side content blocks ---
    private String reading; // FRONT
    private String romaji; // FRONT
    private String audioUrl; // FRONT (AUDIO)
    private String onyomi; // BACK
    private String kunyomi; // BACK
    private String example; // BACK
    private String exampleTranslation; // BACK
    private String note; // BACK
    private String imageUrl; // BACK (IMAGE)
}
