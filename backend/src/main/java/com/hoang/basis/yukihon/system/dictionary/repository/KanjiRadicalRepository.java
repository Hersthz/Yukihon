package com.hoang.basis.yukihon.system.dictionary.repository;

import com.hoang.basis.yukihon.system.dictionary.entity.KanjiRadical;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface KanjiRadicalRepository extends JpaRepository<KanjiRadical, Long> {

    @Query("SELECT DISTINCT r.radical FROM KanjiRadical r ORDER BY r.radical")
    List<String> findDistinctRadicals();

    /** Kanji that contain ALL of the given radicals (intersection). */
    @Query(
            """
            SELECT r.kanji FROM KanjiRadical r
            WHERE r.radical IN :radicals
            GROUP BY r.kanji
            HAVING COUNT(DISTINCT r.radical) = :count
            ORDER BY r.kanji
            """)
    List<String> findKanjiByRadicals(@Param("radicals") List<String> radicals, @Param("count") long count);
}
