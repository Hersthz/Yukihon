package com.hoang.basis.yukihon.dto.translation;

import com.hoang.basis.yukihon.model.TranslationHistory;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranslationHistoryDto {

    private Long id;
    private String sourceLang;
    private String targetLang;
    private String sourceText;
    private String translatedText;
    private boolean bookmarked;
    private Instant createdAt;

    public static TranslationHistoryDto fromEntity(TranslationHistory entity) {
        return TranslationHistoryDto.builder()
                .id(entity.getId())
                .sourceLang(entity.getSourceLang())
                .targetLang(entity.getTargetLang())
                .sourceText(entity.getSourceText())
                .translatedText(entity.getTranslatedText())
                .bookmarked(entity.isBookmarked())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
