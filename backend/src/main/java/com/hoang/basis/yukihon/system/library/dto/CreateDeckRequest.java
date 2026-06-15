package com.hoang.basis.yukihon.system.library.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateDeckRequest {

    @NotBlank
    private String title;

    private String description;

    /** PRIVATE | PUBLIC | UNLISTED */
    private String visibility = "PRIVATE";

    private String sourceLanguage = "ja";

    private String targetLanguage = "vi";
}
