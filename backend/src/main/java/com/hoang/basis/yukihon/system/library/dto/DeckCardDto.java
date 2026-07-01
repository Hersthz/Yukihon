package com.hoang.basis.yukihon.system.library.dto;

/** A card within a deck (flashcard joined with its deck-item ordering). */
public record DeckCardDto(
        Long flashcardId, String front, String back, String hint, String template, Integer orderIndex) {}
