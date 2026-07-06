package com.hoang.basis.yukihon.system.library.dto;

import java.util.List;

/** One face of a flashcard (FRONT/BACK/HINT) with its ordered content blocks. */
public record FlashcardSideDto(String side, List<FlashcardSideContentDto> contents) {}
