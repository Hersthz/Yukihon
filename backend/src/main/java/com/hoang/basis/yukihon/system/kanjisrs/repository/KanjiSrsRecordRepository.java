package com.hoang.basis.yukihon.system.kanjisrs.repository;

import com.hoang.basis.yukihon.system.kanjisrs.entity.KanjiSrsRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface KanjiSrsRecordRepository extends JpaRepository<KanjiSrsRecord, Long> {

    List<KanjiSrsRecord> findByUserIdOrderByNextReviewAtAscCreatedAtDesc(Long userId);

    Optional<KanjiSrsRecord> findByUserIdAndCharacter(Long userId, String character);

    boolean existsByUserIdAndCharacter(Long userId, String character);
}
