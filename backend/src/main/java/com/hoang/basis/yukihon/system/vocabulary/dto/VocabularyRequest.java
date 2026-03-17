package com.hoang.basis.yukihon.system.vocabulary.dto;

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
public class VocabularyRequest {
    
    @NotBlank(message = "Kanji is required")
    @Size(min = 1, max = 100)
    private String kanji;
    
    @NotBlank(message = "Hiragana is required")
    @Size(min = 1, max = 100)
    private String hiragana;
    
    @NotBlank(message = "Romaji is required")
    @Size(min = 1, max = 100)
    private String romaji;
    
    @NotBlank(message = "Meaning is required")
    private String meaning;
    
    private String exampleSentenceJP;
    private String exampleSentenceEN;
    private String wordType;
    private String jlptLevel;
    private String additionalNotes;
}
