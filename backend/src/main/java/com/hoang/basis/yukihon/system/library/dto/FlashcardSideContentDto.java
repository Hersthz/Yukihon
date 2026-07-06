package com.hoang.basis.yukihon.system.library.dto;

/** A labelled content block within a flashcard side. */
public record FlashcardSideContentDto(
        Long id, String label, String contentType, String contentValue, Integer orderIndex) {}
