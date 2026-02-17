package com.hoang.basis.yukihon.repository;

import com.hoang.basis.yukihon.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, Long> {

    List<Quiz> findByQuizType(Quiz.QuizType quizType);

    List<Quiz> findByDifficultyLevel(String difficultyLevel);

    List<Quiz> findByJlptLevel(String jlptLevel);

    @Query("SELECT q FROM Quiz q WHERE q.jlptLevel = :level AND q.difficultyLevel = :difficulty")
    List<Quiz> findByLevelAndDifficulty(@Param("level") String level, @Param("difficulty") String difficulty);

    @Query("SELECT DISTINCT q.difficultyLevel FROM Quiz q")
    List<String> findAllDifficultyLevels();

    long countByJlptLevel(String jlptLevel);
}
