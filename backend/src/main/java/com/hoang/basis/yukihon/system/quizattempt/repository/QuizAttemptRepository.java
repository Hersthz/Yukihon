package com.hoang.basis.yukihon.system.quizattempt.repository;

import com.hoang.basis.yukihon.system.quizattempt.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findTop80ByUserIdOrderByAttemptedAtDesc(Long userId);

    List<QuizAttempt> findTop20ByUserIdOrderByAttemptedAtDesc(Long userId);

    long countByUserId(Long userId);
}
