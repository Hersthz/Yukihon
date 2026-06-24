package com.hoang.basis.yukihon.system.kanji.repository;

import com.hoang.basis.yukihon.system.kanji.entity.KanjiInfo;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KanjiInfoRepository extends JpaRepository<KanjiInfo, Long> {
    Optional<KanjiInfo> findByCharacter(String character);
}
