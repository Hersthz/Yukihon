package com.hoang.basis.yukihon.system.quizsession.repository;

import com.hoang.basis.yukihon.system.quizsession.entity.QuizSession;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizSessionRepository extends JpaRepository<QuizSession, Long> {
    List<QuizSession> findByUserIdOrderByCompletedAtDesc(Long userId, Pageable pageable);
}
