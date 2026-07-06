package com.hoang.basis.yukihon.system.library.repository;

import com.hoang.basis.yukihon.system.library.entity.FlashcardSide;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FlashcardSideRepository extends JpaRepository<FlashcardSide, Long> {

    List<FlashcardSide> findByFlashcardIdOrderByOrderIndexAsc(Long flashcardId);

    List<FlashcardSide> findByFlashcardIdIn(List<Long> flashcardIds);

    void deleteByFlashcardId(Long flashcardId);
}
