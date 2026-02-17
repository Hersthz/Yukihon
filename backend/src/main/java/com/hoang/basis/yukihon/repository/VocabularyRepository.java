package com.hoang.basis.yukihon.repository;

import com.hoang.basis.yukihon.model.Vocabulary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {

    Optional<Vocabulary> findByKanji(String kanji);

    List<Vocabulary> findByJlptLevel(String jlptLevel);

    List<Vocabulary> findByWordType(String wordType);

    @Query("SELECT v FROM Vocabulary v WHERE v.jlptLevel IN :levels ORDER BY v.kanji ASC")
    List<Vocabulary> findByJlptLevelIn(@Param("levels") List<String> levels);

    @Query("SELECT DISTINCT v.jlptLevel FROM Vocabulary v")
    List<String> findAllJlptLevels();

    long countByJlptLevel(String jlptLevel);
}
