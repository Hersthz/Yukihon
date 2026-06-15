package com.hoang.basis.yukihon.system.srs.repository;

import com.hoang.basis.yukihon.system.srs.entity.AnkiSrsProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AnkiSrsProgressRepository extends JpaRepository<AnkiSrsProgress, Long> {

    List<AnkiSrsProgress> findByUserIdAndDeckId(Long userId, Long deckId);

    Optional<AnkiSrsProgress> findByUserIdAndDeckIdAndFlashcardId(Long userId, Long deckId, Long flashcardId);
}
