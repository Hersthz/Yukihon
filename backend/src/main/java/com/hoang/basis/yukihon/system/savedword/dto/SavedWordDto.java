package com.hoang.basis.yukihon.system.savedword.dto;

import com.hoang.basis.yukihon.system.savedword.entity.SavedWord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedWordDto {

    private Long id;
    private Long vocabularyId;
    private String kanji;
    private String hiragana;
    private String romaji;
    private String meaning;
    private String exampleSentenceJP;
    private String exampleSentenceEN;
    private String jlptLevel;
    private String folderName;
    private String personalNote;
    private boolean mastered;
    private Instant createdAt;

    public static SavedWordDto fromEntity(SavedWord saved) {
        return SavedWordDto.builder()
                .id(saved.getId())
                .vocabularyId(saved.getVocabulary().getId())
                .kanji(saved.getVocabulary().getKanji())
                .hiragana(saved.getVocabulary().getHiragana())
                .romaji(saved.getVocabulary().getRomaji())
                .meaning(saved.getVocabulary().getMeaning())
                .exampleSentenceJP(saved.getVocabulary().getExampleSentenceJP())
                .exampleSentenceEN(saved.getVocabulary().getExampleSentenceEN())
                .jlptLevel(saved.getVocabulary().getJlptLevel())
                .folderName(saved.getFolderName())
                .personalNote(saved.getPersonalNote())
                .mastered(saved.isMastered())
                .createdAt(saved.getCreatedAt())
                .build();
    }
}
