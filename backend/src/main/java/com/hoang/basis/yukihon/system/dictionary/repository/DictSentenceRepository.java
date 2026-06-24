package com.hoang.basis.yukihon.system.dictionary.repository;

import com.hoang.basis.yukihon.system.dictionary.entity.DictSentence;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DictSentenceRepository extends JpaRepository<DictSentence, Long> {

    List<DictSentence> findByQueryWordOrderById(String queryWord);

    boolean existsByQueryWord(String queryWord);
}
