package com.hoang.basis.yukihon.system.grammar.repository;

import com.hoang.basis.yukihon.system.grammar.entity.Grammar;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GrammarRepository extends JpaRepository<Grammar, Long> {

    Optional<Grammar> findByPattern(String pattern);

    List<Grammar> findByJlptLevel(String jlptLevel);

    @Query("SELECT g FROM Grammar g WHERE g.jlptLevel IN :levels ORDER BY g.title ASC")
    List<Grammar> findByJlptLevelIn(@Param("levels") List<String> levels);

    @Query("SELECT DISTINCT g.jlptLevel FROM Grammar g")
    List<String> findAllJlptLevels();

    long countByJlptLevel(String jlptLevel);
}
