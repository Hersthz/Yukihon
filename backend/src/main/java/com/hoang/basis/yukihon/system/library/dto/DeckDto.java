package com.hoang.basis.yukihon.system.library.dto;

import com.hoang.basis.yukihon.system.library.entity.Deck;
import java.time.Instant;

/** User-facing deck summary. */
public record DeckDto(
        Long id,
        Long userId,
        String title,
        String description,
        String visibility,
        String sourceLanguage,
        String targetLanguage,
        Integer totalCards,
        Integer favoriteCount,
        Integer cloneCount,
        Long templateId,
        Instant updatedAt) {
    public static DeckDto fromEntity(Deck d) {
        return new DeckDto(
                d.getId(),
                d.getUserId(),
                d.getTitle(),
                d.getDescription(),
                d.getVisibility(),
                d.getSourceLanguage(),
                d.getTargetLanguage(),
                d.getTotalCards(),
                d.getFavoriteCount(),
                d.getCloneCount(),
                d.getTemplateId(),
                d.getUpdatedAt());
    }
}
