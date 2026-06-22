package com.hoang.basis.yukihon.system.library.repository;

import com.hoang.basis.yukihon.system.library.entity.DeckItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeckItemRepository extends JpaRepository<DeckItem, Long> {

    List<DeckItem> findByDeckIdAndIsDeletedFalseOrderByOrderIndexAsc(Long deckId);

    long countByDeckIdAndIsDeletedFalse(Long deckId);

    java.util.Optional<DeckItem> findByDeckIdAndFlashcardIdAndIsDeletedFalse(Long deckId, Long flashcardId);
}
