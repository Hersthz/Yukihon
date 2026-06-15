package com.hoang.basis.yukihon.system.library.repository;

import com.hoang.basis.yukihon.system.library.entity.Deck;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeckRepository extends JpaRepository<Deck, Long> {

    List<Deck> findByUserIdAndIsDeletedFalseOrderByUpdatedAtDesc(Long userId);

    List<Deck> findByVisibilityAndIsDeletedFalseOrderByUpdatedAtDesc(String visibility);
}
