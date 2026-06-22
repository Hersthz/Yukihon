package com.hoang.basis.yukihon.system.translation.dto;

import com.hoang.basis.yukihon.system.translation.entity.TranslationHistory;
import java.time.Instant;
import lombok.*;

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
