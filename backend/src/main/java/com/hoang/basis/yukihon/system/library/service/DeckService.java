package com.hoang.basis.yukihon.system.library.service;

import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.library.dto.AddCardRequest;
import com.hoang.basis.yukihon.system.library.dto.CreateDeckRequest;
import com.hoang.basis.yukihon.system.library.dto.DeckCardDto;
import com.hoang.basis.yukihon.system.library.dto.DeckDto;
import com.hoang.basis.yukihon.system.library.dto.FavoriteToggleResult;
import com.hoang.basis.yukihon.system.library.entity.Deck;
import com.hoang.basis.yukihon.system.library.entity.DeckItem;
import com.hoang.basis.yukihon.system.library.entity.FavoriteDeck;
import com.hoang.basis.yukihon.system.library.entity.Flashcard;
import com.hoang.basis.yukihon.system.library.repository.DeckItemRepository;
import com.hoang.basis.yukihon.system.library.repository.DeckRepository;
import com.hoang.basis.yukihon.system.library.repository.FavoriteDeckRepository;
import com.hoang.basis.yukihon.system.library.repository.FlashcardRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Business logic for the deck library: listing (own/public/favorites), CRUD, favorite toggling,
 * deep-cloning, and the flashcards inside a deck. Keeps the controllers thin and the repository
 * access + ownership rules in one place.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class DeckService {

    private final DeckRepository deckRepository;
    private final DeckItemRepository deckItemRepository;
    private final FlashcardRepository flashcardRepository;
    private final FavoriteDeckRepository favoriteDeckRepository;

    // ===================== DECK LISTING =====================

    @Transactional(readOnly = true)
    public List<DeckDto> listMine(Long userId) {
        return deckRepository.findByUserIdAndIsDeletedFalseOrderByUpdatedAtDesc(userId).stream()
                .map(DeckDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DeckDto> listPublic(String search, String sort) {
        String q = search == null ? "" : search.trim().toLowerCase();
        Comparator<Deck> comparator =
                switch (sort == null ? "trending" : sort) {
                    case "newest" -> Comparator.comparing(Deck::getUpdatedAt).reversed();
                    case "cards" -> Comparator.comparing(Deck::getTotalCards, Comparator.reverseOrder());
                    default -> Comparator.comparingInt(
                                    (Deck d) -> nvl(d.getCloneCount()) * 2 + nvl(d.getFavoriteCount()))
                            .reversed();
                };

        return deckRepository.findByVisibilityAndIsDeletedFalseOrderByUpdatedAtDesc("PUBLIC").stream()
                .filter(d -> q.isEmpty()
                        || (d.getTitle() != null && d.getTitle().toLowerCase().contains(q))
                        || (d.getDescription() != null
                                && d.getDescription().toLowerCase().contains(q)))
                .sorted(comparator)
                .map(DeckDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DeckDto> listFavorites(Long userId) {
        Set<Long> ids = favoriteDeckRepository.findByUserId(userId).stream()
                .map(FavoriteDeck::getDeckId)
                .collect(Collectors.toSet());
        return deckRepository.findAllById(ids).stream()
                .filter(d -> !Boolean.TRUE.equals(d.getIsDeleted()))
                .map(DeckDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public DeckDto get(Long userId, Long deckId) {
        return DeckDto.fromEntity(requireVisible(deckId, userId));
    }

    // ===================== DECK MUTATION =====================

    public DeckDto create(Long userId, CreateDeckRequest request) {
        Deck deck = new Deck();
        deck.setUserId(userId);
        deck.setTitle(request.getTitle());
        deck.setDescription(request.getDescription());
        deck.setVisibility(request.getVisibility() != null ? request.getVisibility() : "PRIVATE");
        deck.setSourceLanguage(request.getSourceLanguage());
        deck.setTargetLanguage(request.getTargetLanguage());
        deck.setTotalCards(0);
        return DeckDto.fromEntity(deckRepository.save(deck));
    }

    /** Toggle favorite for a deck; returns the new state + updated count. */
    public FavoriteToggleResult toggleFavorite(Long userId, Long deckId) {
        Deck deck = loadActive(deckId);
        Optional<FavoriteDeck> existing = favoriteDeckRepository.findByUserIdAndDeckId(userId, deckId);
        boolean favorited;
        if (existing.isPresent()) {
            favoriteDeckRepository.delete(existing.get());
            deck.setFavoriteCount(Math.max(0, nvl(deck.getFavoriteCount()) - 1));
            favorited = false;
        } else {
            FavoriteDeck fav = new FavoriteDeck();
            fav.setUserId(userId);
            fav.setDeckId(deckId);
            favoriteDeckRepository.save(fav);
            deck.setFavoriteCount(nvl(deck.getFavoriteCount()) + 1);
            favorited = true;
        }
        deckRepository.save(deck);
        return new FavoriteToggleResult(favorited, deck.getFavoriteCount());
    }

    /** Deep-copy a deck (own or PUBLIC) into the user's library, including its cards. */
    public DeckDto clone(Long userId, Long deckId) {
        Deck source = requireVisible(deckId, userId);

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
            fc.setTemplate(src.getTemplate());
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

        source.setCloneCount(nvl(source.getCloneCount()) + 1);
        deckRepository.save(source);

        return DeckDto.fromEntity(savedDeck);
    }

    // ===================== CARDS =====================

    @Transactional(readOnly = true)
    public List<DeckCardDto> listCards(Long userId, Long deckId) {
        requireVisible(deckId, userId);
        List<DeckItem> items = deckItemRepository.findByDeckIdAndIsDeletedFalseOrderByOrderIndexAsc(deckId);
        Map<Long, Flashcard> fcMap =
                flashcardRepository
                        .findAllById(
                                items.stream().map(DeckItem::getFlashcardId).toList())
                        .stream()
                        .collect(Collectors.toMap(Flashcard::getId, f -> f));

        return items.stream()
                .map(item -> {
                    Flashcard fc = fcMap.get(item.getFlashcardId());
                    return fc == null
                            ? null
                            : new DeckCardDto(
                                    fc.getId(),
                                    fc.getFront(),
                                    fc.getBack(),
                                    fc.getHint(),
                                    fc.getTemplate(),
                                    item.getOrderIndex());
                })
                .filter(c -> c != null)
                .toList();
    }

    public DeckCardDto addCard(Long userId, Long deckId, AddCardRequest request) {
        Deck deck = requireOwner(deckId, userId);

        Flashcard fc = new Flashcard();
        fc.setCardType("BASIC");
        fc.setItemType("GENERIC");
        fc.setFront(request.getFront());
        fc.setBack(request.getBack());
        fc.setHint(request.getHint());
        fc.setTemplate("FORWARD_REVERSE".equals(request.getTemplate()) ? "FORWARD_REVERSE" : "FORWARD");
        Flashcard savedFc = flashcardRepository.save(fc);

        int nextOrder = (int) deckItemRepository.countByDeckIdAndIsDeletedFalse(deckId);
        DeckItem item = new DeckItem();
        item.setDeckId(deckId);
        item.setFlashcardId(savedFc.getId());
        item.setOrderIndex(nextOrder);
        deckItemRepository.save(item);

        deck.setTotalCards((int) deckItemRepository.countByDeckIdAndIsDeletedFalse(deckId));
        deckRepository.save(deck);

        return new DeckCardDto(
                savedFc.getId(),
                savedFc.getFront(),
                savedFc.getBack(),
                savedFc.getHint(),
                savedFc.getTemplate(),
                nextOrder);
    }

    public void removeCard(Long userId, Long deckId, Long flashcardId) {
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
    }

    // ===================== HELPERS =====================

    private Deck loadActive(Long deckId) {
        return deckRepository
                .findById(deckId)
                .filter(d -> !Boolean.TRUE.equals(d.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Deck not found: " + deckId));
    }

    /** Load a deck the user may view (owner or PUBLIC), else 404. */
    private Deck requireVisible(Long deckId, Long userId) {
        Deck deck = loadActive(deckId);
        if (!deck.getUserId().equals(userId) && !"PUBLIC".equals(deck.getVisibility())) {
            throw new ResourceNotFoundException("Deck not found: " + deckId);
        }
        return deck;
    }

    /** Load a deck the user owns, else 403. */
    private Deck requireOwner(Long deckId, Long userId) {
        Deck deck = loadActive(deckId);
        if (!deck.getUserId().equals(userId)) {
            throw new AccessDeniedException("Not your deck");
        }
        return deck;
    }

    private int nvl(Integer v) {
        return v != null ? v : 0;
    }
}
