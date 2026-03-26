package com.hoang.basis.yukihon.system.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentLevelBreakdownDto {
    private String jlptLevel;
    private long lessons;
    private long vocabulary;
    private long grammar;
    private long quizzes;
    private long total;
}
