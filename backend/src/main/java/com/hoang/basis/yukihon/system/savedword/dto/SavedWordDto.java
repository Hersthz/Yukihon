package com.hoang.basis.yukihon.system.savedword.dto;

import com.hoang.basis.yukihon.system.savedword.entity.SavedWord;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private Integer reviewIntervalDays;
    private Double easeFactor;
    private Integer repetitionCount;
    private Integer reviewCount;
    private Instant lastReviewedAt;
    private Instant nextReviewAt;
    private boolean dueForReview;
    private String studyFocus;
    private Instant createdAt;

    public static SavedWordDto fromEntity(SavedWord saved) {
        String kanji = saved.getVocabulary().getKanji();
        String studyFocus = kanji != null && !kanji.isBlank() ? "KANJI" : "VOCABULARY";
        Instant nextReviewAt = saved.getNextReviewAt();

        return SavedWordDto.builder()
                .id(saved.getId())
                .vocabularyId(saved.getVocabulary().getId())
                .kanji(kanji)
                .hiragana(saved.getVocabulary().getHiragana())
                .romaji(saved.getVocabulary().getRomaji())
                .meaning(saved.getVocabulary().getMeaning())
                .exampleSentenceJP(saved.getVocabulary().getExampleSentenceJP())
                .exampleSentenceEN(saved.getVocabulary().getExampleSentenceEN())
                .jlptLevel(saved.getVocabulary().getJlptLevel())
                .folderName(saved.getFolderName())
                .personalNote(saved.getPersonalNote())
                .mastered(saved.isMastered())
                .reviewIntervalDays(saved.getReviewIntervalDays())
                .easeFactor(saved.getEaseFactor())
                .repetitionCount(saved.getRepetitionCount())
                .reviewCount(saved.getReviewCount())
                .lastReviewedAt(saved.getLastReviewedAt())
                .nextReviewAt(nextReviewAt)
                .dueForReview(nextReviewAt == null || !nextReviewAt.isAfter(Instant.now()))
                .studyFocus(studyFocus)
                .createdAt(saved.getCreatedAt())
                .build();
    }
}
