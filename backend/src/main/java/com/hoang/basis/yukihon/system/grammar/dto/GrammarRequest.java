package com.hoang.basis.yukihon.system.grammar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 200)
    private String title;

    @NotBlank(message = "Pattern is required")
    @Size(min = 1, max = 100)
    private String pattern;

    private String explanation;
    private String usage;
    private String exampleJP;
    private String exampleEN;
    private String jlptLevel;
    private String relatedPatterns;
    private String notes;
}
