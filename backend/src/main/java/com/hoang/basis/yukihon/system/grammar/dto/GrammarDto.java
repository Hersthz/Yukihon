package com.hoang.basis.yukihon.system.grammar.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarDto {
    private Long id;
    private String title;
    private String pattern;
    private String explanation;
    private String usage;
    private String exampleJP;
    private String exampleEN;
    private String jlptLevel;
    private String relatedPatterns;
    private String notes;
}
