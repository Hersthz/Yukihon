package com.hoang.basis.yukihon.system.library.controller;

import com.hoang.basis.yukihon.base.security.CurrentUserId;
import com.hoang.basis.yukihon.system.library.dto.CreateDeckRequest;
import com.hoang.basis.yukihon.system.library.dto.DeckDto;
import com.hoang.basis.yukihon.system.library.dto.FavoriteToggleResult;
import com.hoang.basis.yukihon.system.library.service.DeckService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** User-facing deck library: list/own/public decks and create a deck scoped to the current user. */
@RestController
@RequestMapping("/api/decks")
@RequiredArgsConstructor
public class DeckController {

    private final DeckService deckService;

    @GetMapping("/mine")
    public ResponseEntity<List<DeckDto>> myDecks(@CurrentUserId Long userId) {
        return ResponseEntity.ok(deckService.listMine(userId));
    }

    @GetMapping("/public")
    public ResponseEntity<List<DeckDto>> publicDecks(
            @RequestParam(required = false) String search, @RequestParam(defaultValue = "trending") String sort) {
        return ResponseEntity.ok(deckService.listPublic(search, sort));
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<DeckDto>> favorites(@CurrentUserId Long userId) {
        return ResponseEntity.ok(deckService.listFavorites(userId));
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<FavoriteToggleResult> toggleFavorite(@PathVariable Long id, @CurrentUserId Long userId) {
        return ResponseEntity.ok(deckService.toggleFavorite(userId, id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeckDto> getDeck(@PathVariable Long id, @CurrentUserId Long userId) {
        return ResponseEntity.ok(deckService.get(userId, id));
    }

    @PostMapping
    public ResponseEntity<DeckDto> create(@Valid @RequestBody CreateDeckRequest request, @CurrentUserId Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(deckService.create(userId, request));
    }

    @PostMapping("/{id}/clone")
    public ResponseEntity<DeckDto> clone(@PathVariable Long id, @CurrentUserId Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(deckService.clone(userId, id));
    }

    /** Record a view (bumped only when a non-owner opens the deck). */
    @PostMapping("/{id}/view")
    public ResponseEntity<Void> recordView(@PathVariable Long id, @CurrentUserId Long userId) {
        deckService.recordView(userId, id);
        return ResponseEntity.noContent().build();
    }

    /** Attach a render template to the deck (templateId null clears it). */
    @PutMapping("/{id}/template")
    public ResponseEntity<DeckDto> setTemplate(
            @PathVariable Long id, @RequestBody SetTemplateRequest body, @CurrentUserId Long userId) {
        return ResponseEntity.ok(deckService.setDeckTemplate(userId, id, body.templateId()));
    }

    /** Body for attaching/clearing a deck template. */
    public record SetTemplateRequest(Long templateId) {}
}
