package com.hoang.basis.yukihon.system.library.dto;

/** A card render template (HTML front/back + CSS). */
public record FlashcardTemplateDto(
        Long id,
        String cardType,
        String name,
        String description,
        String frontTemplate,
        String backTemplate,
        String styling,
        boolean isSystem,
        boolean isDefault,
        boolean mine) {}
