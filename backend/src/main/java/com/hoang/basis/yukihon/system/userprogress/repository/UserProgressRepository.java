package com.hoang.basis.yukihon.system.userprogress.repository;

import com.hoang.basis.yukihon.system.userprogress.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {

    List<UserProgress> findByUserId(Long userId);

    @Query("SELECT up FROM UserProgress up WHERE up.userId = :userId AND up.status = :status")
    List<UserProgress> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") UserProgress.ProgressStatus status);

    Optional<UserProgress> findByUserIdAndLessonId(Long userId, Long lessonId);

    Optional<UserProgress> findByUserIdAndQuizId(Long userId, Long quizId);

    Optional<UserProgress> findByUserIdAndVocabularyId(Long userId, Long vocabularyId);

    @Query("SELECT COUNT(up) FROM UserProgress up WHERE up.userId = :userId AND up.status = 'COMPLETED'")
    long countCompletedByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(up.score), 0) FROM UserProgress up WHERE up.userId = :userId")
    Integer getTotalScoreByUserId(@Param("userId") Long userId);
}
