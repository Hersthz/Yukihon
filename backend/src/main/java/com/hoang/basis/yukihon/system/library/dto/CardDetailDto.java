package com.hoang.basis.yukihon.system.library.dto;

import java.util.List;

/** Full card detail: flat summary fields + the rich FRONT/BACK/HINT sides. */
public record CardDetailDto(
        Long flashcardId, String front, String back, String hint, String template, List<FlashcardSideDto> sides) {}
