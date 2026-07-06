package com.hoang.basis.yukihon.system.library.controller;

import com.hoang.basis.yukihon.base.security.CurrentUserId;
import com.hoang.basis.yukihon.system.library.dto.AddCardRequest;
import com.hoang.basis.yukihon.system.library.dto.CardDetailDto;
import com.hoang.basis.yukihon.system.library.dto.DeckCardDto;
import com.hoang.basis.yukihon.system.library.service.DeckService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Manage the flashcards inside a deck (list / add / remove), scoped to the deck owner. */
@RestController
@RequestMapping("/api/decks/{deckId}/cards")
@RequiredArgsConstructor
public class DeckCardController {

    private final DeckService deckService;

    @GetMapping
    public ResponseEntity<List<DeckCardDto>> list(@PathVariable Long deckId, @CurrentUserId Long userId) {
        return ResponseEntity.ok(deckService.listCards(userId, deckId));
    }

    @GetMapping("/{flashcardId}")
    public ResponseEntity<CardDetailDto> detail(
            @PathVariable Long deckId, @PathVariable Long flashcardId, @CurrentUserId Long userId) {
        return ResponseEntity.ok(deckService.getCardDetail(userId, deckId, flashcardId));
    }

    @PostMapping
    public ResponseEntity<DeckCardDto> add(
            @PathVariable Long deckId, @Valid @RequestBody AddCardRequest request, @CurrentUserId Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(deckService.addCard(userId, deckId, request));
    }

    @DeleteMapping("/{flashcardId}")
    public ResponseEntity<Void> remove(
            @PathVariable Long deckId, @PathVariable Long flashcardId, @CurrentUserId Long userId) {
        deckService.removeCard(userId, deckId, flashcardId);
        return ResponseEntity.noContent().build();
    }
}
