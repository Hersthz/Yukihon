package com.hoang.basis.yukihon.system.quizletstudy.repository;

import com.hoang.basis.yukihon.system.quizletstudy.entity.QuizletStudySession;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizletStudySessionRepository extends JpaRepository<QuizletStudySession, Long> {

    List<QuizletStudySession> findTop20ByUserIdAndDeckIdOrderByStartedAtDesc(Long userId, Long deckId);

    Optional<QuizletStudySession> findByIdAndUserId(Long id, Long userId);
}
