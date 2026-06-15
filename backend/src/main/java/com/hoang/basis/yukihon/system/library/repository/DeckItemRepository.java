package com.hoang.basis.yukihon.system.library.repository;

import com.hoang.basis.yukihon.system.library.entity.DeckItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeckItemRepository extends JpaRepository<DeckItem, Long> {

    List<DeckItem> findByDeckIdAndIsDeletedFalseOrderByOrderIndexAsc(Long deckId);

    long countByDeckIdAndIsDeletedFalse(Long deckId);

    java.util.Optional<DeckItem> findByDeckIdAndFlashcardIdAndIsDeletedFalse(Long deckId, Long flashcardId);
}
