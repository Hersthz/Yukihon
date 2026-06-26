package com.hoang.basis.yukihon.system.library.repository;

import com.hoang.basis.yukihon.system.library.entity.FavoriteDeck;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FavoriteDeckRepository extends JpaRepository<FavoriteDeck, Long> {

    Optional<FavoriteDeck> findByUserIdAndDeckId(Long userId, Long deckId);

    List<FavoriteDeck> findByUserId(Long userId);
}
