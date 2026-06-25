package com.hoang.basis.yukihon.system.quizletstudy.repository;

import com.hoang.basis.yukihon.system.quizletstudy.entity.QuizletCardProgress;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizletCardProgressRepository extends JpaRepository<QuizletCardProgress, Long> {

    List<QuizletCardProgress> findByUserIdAndDeckId(Long userId, Long deckId);

    Optional<QuizletCardProgress> findByUserIdAndDeckIdAndFlashcardId(Long userId, Long deckId, Long flashcardId);
}
