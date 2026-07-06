package com.hoang.basis.yukihon.system.library.repository;

import com.hoang.basis.yukihon.system.library.entity.FlashcardSideContent;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FlashcardSideContentRepository extends JpaRepository<FlashcardSideContent, Long> {

    List<FlashcardSideContent> findBySideIdInOrderByOrderIndexAsc(List<Long> sideIds);

    void deleteBySideIdIn(List<Long> sideIds);
}
