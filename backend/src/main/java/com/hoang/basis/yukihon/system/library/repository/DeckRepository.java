package com.hoang.basis.yukihon.system.library.repository;

import com.hoang.basis.yukihon.system.library.entity.Deck;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeckRepository extends JpaRepository<Deck, Long> {

    List<Deck> findByUserIdAndIsDeletedFalseOrderByUpdatedAtDesc(Long userId);

    List<Deck> findByVisibilityAndIsDeletedFalseOrderByUpdatedAtDesc(String visibility);
}
