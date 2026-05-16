package com.hoang.basis.yukihon.system.quizattempt.repository;

import com.hoang.basis.yukihon.system.quizattempt.entity.QuizAttempt;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findTop80ByUserIdOrderByAttemptedAtDesc(Long userId);

    List<QuizAttempt> findTop20ByUserIdOrderByAttemptedAtDesc(Long userId);

    @Query("""
            SELECT qa
            FROM QuizAttempt qa
            WHERE qa.userId = :userId
              AND (:correct IS NULL OR qa.correct = :correct)
            ORDER BY qa.attemptedAt DESC
            """)
    List<QuizAttempt> findRecentByUserIdAndCorrect(
            @Param("userId") Long userId,
            @Param("correct") Boolean correct,
            Pageable pageable
    );

    long countByUserId(Long userId);
}
