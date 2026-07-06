package com.hoang.basis.yukihon.system.library.repository;

import com.hoang.basis.yukihon.system.library.entity.FlashcardTemplate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FlashcardTemplateRepository extends JpaRepository<FlashcardTemplate, Long> {

    Optional<FlashcardTemplate> findFirstByIsSystemTrueAndIsDefaultTrueAndCardType(String cardType);

    /** System templates + the user's own — the set a user may pick from. */
    List<FlashcardTemplate> findByIsSystemTrueOrUserId(Long userId);
}
