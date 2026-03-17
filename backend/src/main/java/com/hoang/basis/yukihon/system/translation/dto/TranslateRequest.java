package com.hoang.basis.yukihon.system.translation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranslateRequest {

    @NotBlank(message = "Source language is required")
    @Size(max = 10)
    private String sourceLang;

    @NotBlank(message = "Target language is required")
    @Size(max = 10)
    private String targetLang;

    @NotBlank(message = "Text is required")
    @Size(max = 5000, message = "Text must not exceed 5000 characters")
    private String text;
}
