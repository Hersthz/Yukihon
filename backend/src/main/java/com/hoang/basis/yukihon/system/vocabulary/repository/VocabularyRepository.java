package com.hoang.basis.yukihon.system.vocabulary.repository;

import com.hoang.basis.yukihon.system.vocabulary.entity.Vocabulary;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {

    Optional<Vocabulary> findByKanji(String kanji);

    List<Vocabulary> findByJlptLevel(String jlptLevel);

    List<Vocabulary> findByWordType(String wordType);

    @Query("SELECT v FROM Vocabulary v WHERE v.jlptLevel IN :levels ORDER BY v.kanji ASC")
    List<Vocabulary> findByJlptLevelIn(@Param("levels") List<String> levels);

    @Query("SELECT DISTINCT v.jlptLevel FROM Vocabulary v")
    List<String> findAllJlptLevels();

    @Query(
            """
            SELECT v FROM Vocabulary v
            WHERE v.kanji LIKE CONCAT('%', :q, '%')
               OR v.hiragana LIKE CONCAT('%', :q, '%')
               OR LOWER(v.romaji) LIKE LOWER(CONCAT('%', :q, '%'))
               OR LOWER(v.meaning) LIKE LOWER(CONCAT('%', :q, '%'))
            ORDER BY v.kanji ASC
            """)
    List<Vocabulary> searchForDictionary(@Param("q") String query, Pageable pageable);

    long countByJlptLevel(String jlptLevel);
}
