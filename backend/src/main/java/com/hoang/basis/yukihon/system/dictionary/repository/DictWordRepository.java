package com.hoang.basis.yukihon.system.dictionary.repository;

import com.hoang.basis.yukihon.system.dictionary.entity.DictWord;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DictWordRepository extends JpaRepository<DictWord, Long> {

    /**
     * Lookup by exact/prefix match on a Japanese form or romaji (index-friendly), or a substring of
     * the English glosses. Common words first. Prefix on kanji/kana/romaji uses their indexes.
     */
    @Query(
            """
            SELECT w FROM DictWord w
            WHERE w.kanji LIKE CONCAT(:q, '%')
               OR w.kana LIKE CONCAT(:q, '%')
               OR LOWER(w.romaji) LIKE LOWER(CONCAT(:q, '%'))
               OR LOWER(w.glossesEn) LIKE LOWER(CONCAT('%', :q, '%'))
            ORDER BY w.common DESC, w.id ASC
            """)
    List<DictWord> search(@Param("q") String query, Pageable pageable);

    /**
     * Compound / related words that CONTAIN the given form (e.g. 手を結ぶ for 結ぶ), excluding the
     * word itself. Common words first.
     */
    @Query(
            """
            SELECT w FROM DictWord w
            WHERE (w.kanji LIKE CONCAT('%', :q, '%') OR w.kana LIKE CONCAT('%', :q, '%'))
              AND NOT (w.kanji = :q OR w.kana = :q)
            ORDER BY w.common DESC, w.id ASC
            """)
    List<DictWord> findRelated(@Param("q") String query, Pageable pageable);
}
