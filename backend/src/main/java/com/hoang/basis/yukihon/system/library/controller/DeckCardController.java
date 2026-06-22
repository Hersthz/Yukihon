package com.hoang.basis.yukihon.system.library.controller;

import com.hoang.basis.yukihon.base.security.CurrentUserId;
import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.library.dto.AddCardRequest;
import com.hoang.basis.yukihon.system.library.dto.DeckCardDto;
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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;
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

    private final DeckRepository deckRepository;
    private final DeckItemRepository deckItemRepository;
    private final FlashcardRepository flashcardRepository;

    private Deck loadDeck(Long deckId) {
        return deckRepository
                .findById(deckId)
                .filter(d -> !Boolean.TRUE.equals(d.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Deck not found: " + deckId));
    }

    private Deck requireOwner(Long deckId, Long userId) {
        Deck deck = loadDeck(deckId);
        if (!deck.getUserId().equals(userId)) {
            throw new AccessDeniedException("Not your deck");
        }
        return deck;
    }

    @GetMapping
    public ResponseEntity<List<DeckCardDto>> list(@PathVariable Long deckId, @CurrentUserId Long userId) {
        Deck deck = loadDeck(deckId);
        if (!deck.getUserId().equals(userId) && !"PUBLIC".equals(deck.getVisibility())) {
            throw new ResourceNotFoundException("Deck not found: " + deckId);
        }

        List<DeckItem> items = deckItemRepository.findByDeckIdAndIsDeletedFalseOrderByOrderIndexAsc(deckId);
        Map<Long, Flashcard> fcMap =
                flashcardRepository
                        .findAllById(
                                items.stream().map(DeckItem::getFlashcardId).toList())
                        .stream()
                        .collect(Collectors.toMap(Flashcard::getId, f -> f));

        List<DeckCardDto> cards = items.stream()
                .map(item -> {
                    Flashcard fc = fcMap.get(item.getFlashcardId());
                    return fc == null
                            ? null
                            : new DeckCardDto(
                                    fc.getId(), fc.getFront(), fc.getBack(), fc.getHint(), item.getOrderIndex());
                })
                .filter(c -> c != null)
                .toList();
        return ResponseEntity.ok(cards);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<DeckCardDto> add(
            @PathVariable Long deckId, @Valid @RequestBody AddCardRequest request, @CurrentUserId Long userId) {
        Deck deck = requireOwner(deckId, userId);

        Flashcard fc = new Flashcard();
        fc.setCardType("BASIC");
        fc.setItemType("GENERIC");
        fc.setFront(request.getFront());
        fc.setBack(request.getBack());
        fc.setHint(request.getHint());
        Flashcard savedFc = flashcardRepository.save(fc);

        int nextOrder = (int) deckItemRepository.countByDeckIdAndIsDeletedFalse(deckId);
        DeckItem item = new DeckItem();
        item.setDeckId(deckId);
        item.setFlashcardId(savedFc.getId());
        item.setOrderIndex(nextOrder);
        deckItemRepository.save(item);

        deck.setTotalCards((int) deckItemRepository.countByDeckIdAndIsDeletedFalse(deckId));
        deckRepository.save(deck);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new DeckCardDto(
                        savedFc.getId(), savedFc.getFront(), savedFc.getBack(), savedFc.getHint(), nextOrder));
    }

    @DeleteMapping("/{flashcardId}")
    @Transactional
    public ResponseEntity<Void> remove(
            @PathVariable Long deckId, @PathVariable Long flashcardId, @CurrentUserId Long userId) {
        Deck deck = requireOwner(deckId, userId);

        DeckItem item = deckItemRepository
                .findByDeckIdAndFlashcardIdAndIsDeletedFalse(deckId, flashcardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not in deck"));
        item.setIsDeleted(true);
        deckItemRepository.save(item);

        flashcardRepository.findById(flashcardId).ifPresent(fc -> {
            fc.setIsDeleted(true);
            flashcardRepository.save(fc);
        });

        deck.setTotalCards((int) deckItemRepository.countByDeckIdAndIsDeletedFalse(deckId));
        deckRepository.save(deck);
        return ResponseEntity.noContent().build();
    }
}
