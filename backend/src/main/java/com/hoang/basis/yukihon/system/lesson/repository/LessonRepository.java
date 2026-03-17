package com.hoang.basis.yukihon.system.lesson.repository;

import com.hoang.basis.yukihon.system.lesson.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByStatus(Lesson.LessonStatus status);

    List<Lesson> findByJlptLevel(String jlptLevel);

    List<Lesson> findByCategory(String category);

    @Query("SELECT l FROM Lesson l WHERE l.status = 'PUBLISHED' ORDER BY l.orderIndex ASC")
    List<Lesson> findPublishedLessons();

    @Query("SELECT l FROM Lesson l WHERE l.jlptLevel = :level AND l.status = 'PUBLISHED' ORDER BY l.orderIndex ASC")
    List<Lesson> findPublishedLessonsByLevel(@Param("level") String level);

    @Query("SELECT l FROM Lesson l WHERE l.category = :category AND l.status = 'PUBLISHED' ORDER BY l.orderIndex ASC")
    List<Lesson> findPublishedLessonsByCategory(@Param("category") String category);

    long countByStatus(Lesson.LessonStatus status);
}
