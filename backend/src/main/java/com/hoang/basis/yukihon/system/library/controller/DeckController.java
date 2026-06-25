package com.hoang.basis.yukihon.system.library.controller;

import com.hoang.basis.yukihon.base.security.CurrentUserId;
import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.library.dto.CreateDeckRequest;
import com.hoang.basis.yukihon.system.library.dto.DeckDto;
import com.hoang.basis.yukihon.system.library.entity.Deck;
import com.hoang.basis.yukihon.system.library.entity.DeckItem;
import com.hoang.basis.yukihon.system.library.entity.Flashcard;
import com.hoang.basis.yukihon.system.library.repository.DeckItemRepository;
import com.hoang.basis.yukihon.system.library.repository.DeckRepository;
import com.hoang.basis.yukihon.system.library.repository.FlashcardRepository;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** User-facing deck library: list/own/public decks and create a deck scoped to the current user. */
@RestController
@RequestMapping("/api/decks")
@RequiredArgsConstructor
public class DeckController {

    private final DeckRepository deckRepository;
    private final DeckItemRepository deckItemRepository;
    private final FlashcardRepository flashcardRepository;

    @GetMapping("/mine")
    public ResponseEntity<List<DeckDto>> myDecks(@CurrentUserId Long userId) {
        List<DeckDto> decks = deckRepository.findByUserIdAndIsDeletedFalseOrderByUpdatedAtDesc(userId).stream()
                .map(DeckDto::fromEntity)
                .toList();
        return ResponseEntity.ok(decks);
    }

    @GetMapping("/public")
    public ResponseEntity<List<DeckDto>> publicDecks() {
        List<DeckDto> decks = deckRepository.findByVisibilityAndIsDeletedFalseOrderByUpdatedAtDesc("PUBLIC").stream()
                .map(DeckDto::fromEntity)
                .toList();
        return ResponseEntity.ok(decks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeckDto> getDeck(@PathVariable Long id, @CurrentUserId Long userId) {
        Deck deck = deckRepository
                .findById(id)
                .filter(d -> !Boolean.TRUE.equals(d.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Deck not found: " + id));
        if (!deck.getUserId().equals(userId) && !"PUBLIC".equals(deck.getVisibility())) {
            throw new ResourceNotFoundException("Deck not found: " + id);
        }
        return ResponseEntity.ok(DeckDto.fromEntity(deck));
    }

    @PostMapping
    public ResponseEntity<DeckDto> create(@Valid @RequestBody CreateDeckRequest request, @CurrentUserId Long userId) {
        Deck deck = new Deck();
        deck.setUserId(userId);
        deck.setTitle(request.getTitle());
        deck.setDescription(request.getDescription());
        deck.setVisibility(request.getVisibility() != null ? request.getVisibility() : "PRIVATE");
        deck.setSourceLanguage(request.getSourceLanguage());
        deck.setTargetLanguage(request.getTargetLanguage());
        deck.setTotalCards(0);
        Deck saved = deckRepository.save(deck);
        return ResponseEntity.status(HttpStatus.CREATED).body(DeckDto.fromEntity(saved));
    }

    /** Deep-copy a deck (own or PUBLIC) into the current user's library, including its cards. */
    @PostMapping("/{id}/clone")
    @Transactional
    public ResponseEntity<DeckDto> clone(@PathVariable Long id, @CurrentUserId Long userId) {
        Deck source = deckRepository
                .findById(id)
                .filter(d -> !Boolean.TRUE.equals(d.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Deck not found: " + id));
        if (!source.getUserId().equals(userId) && !"PUBLIC".equals(source.getVisibility())) {
            throw new ResourceNotFoundException("Deck not found: " + id);
        }

        Deck copy = new Deck();
        copy.setUserId(userId);
        copy.setTitle(source.getTitle() + " (bản sao)");
        copy.setDescription(source.getDescription());
        copy.setVisibility("PRIVATE");
        copy.setSourceLanguage(source.getSourceLanguage());
        copy.setTargetLanguage(source.getTargetLanguage());
        copy.setCoverImageUrl(source.getCoverImageUrl());
        copy.setOriginalDeckId(source.getId());
        copy.setTotalCards(0);
        Deck savedDeck = deckRepository.save(copy);

        List<DeckItem> items = deckItemRepository.findByDeckIdAndIsDeletedFalseOrderByOrderIndexAsc(source.getId());
        Map<Long, Flashcard> fcMap =
                flashcardRepository
                        .findAllById(
                                items.stream().map(DeckItem::getFlashcardId).toList())
                        .stream()
                        .collect(Collectors.toMap(Flashcard::getId, f -> f));

        int order = 0;
        for (DeckItem it : items) {
            Flashcard src = fcMap.get(it.getFlashcardId());
            if (src == null) {
                continue;
            }
            Flashcard fc = new Flashcard();
            fc.setCardType(src.getCardType());
            fc.setItemType(src.getItemType());
            fc.setItemId(src.getItemId());
            fc.setFront(src.getFront());
            fc.setBack(src.getBack());
            fc.setHint(src.getHint());
            fc.setExplanation(src.getExplanation());
            fc.setImageUrl(src.getImageUrl());
            fc.setAudioUrl(src.getAudioUrl());
            Flashcard savedFc = flashcardRepository.save(fc);

            DeckItem ni = new DeckItem();
            ni.setDeckId(savedDeck.getId());
            ni.setFlashcardId(savedFc.getId());
            ni.setOrderIndex(order++);
            deckItemRepository.save(ni);
        }

        savedDeck.setTotalCards(order);
        deckRepository.save(savedDeck);

        Integer clones = source.getCloneCount();
        source.setCloneCount((clones != null ? clones : 0) + 1);
        deckRepository.save(source);

        return ResponseEntity.status(HttpStatus.CREATED).body(DeckDto.fromEntity(savedDeck));
    }
}
