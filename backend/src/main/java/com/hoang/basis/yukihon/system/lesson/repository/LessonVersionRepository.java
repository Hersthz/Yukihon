package com.hoang.basis.yukihon.system.lesson.repository;

import com.hoang.basis.yukihon.system.lesson.entity.LessonVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LessonVersionRepository extends JpaRepository<LessonVersion, Long> {

    List<LessonVersion> findByLessonIdOrderByVersionNumberDesc(Long lessonId);

    @Query("SELECT COALESCE(MAX(lv.versionNumber), 0) FROM LessonVersion lv WHERE lv.lessonId = :lessonId")
    Integer findMaxVersionNumberByLessonId(@Param("lessonId") Long lessonId);
}
