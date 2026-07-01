package com.hoang.basis.yukihon.system.srs.repository;

import com.hoang.basis.yukihon.system.srs.entity.AnkiSrsProgress;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnkiSrsProgressRepository extends JpaRepository<AnkiSrsProgress, Long> {

    List<AnkiSrsProgress> findByUserIdAndDeckId(Long userId, Long deckId);

    Optional<AnkiSrsProgress> findByUserIdAndDeckIdAndFlashcardIdAndSide(
            Long userId, Long deckId, Long flashcardId, String side);

    List<AnkiSrsProgress> findByUserIdAndDeckIdAndFlashcardId(Long userId, Long deckId, Long flashcardId);
}
