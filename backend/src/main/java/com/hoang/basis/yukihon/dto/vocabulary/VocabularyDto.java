package com.hoang.basis.yukihon.dto.vocabulary;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabularyDto {
    private Long id;
    private String kanji;
    private String hiragana;
    private String romaji;
    private String meaning;
    private String exampleSentenceJP;
    private String exampleSentenceEN;
    private String wordType;
    private String jlptLevel;
    private String additionalNotes;
}
