package com.hoang.basis.yukihon.system.kanjisrs.repository;

import com.hoang.basis.yukihon.system.kanjisrs.entity.KanjiSrsRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.time.Instant;

public interface KanjiSrsRecordRepository extends JpaRepository<KanjiSrsRecord, Long> {

    List<KanjiSrsRecord> findByUserIdOrderByNextReviewAtAscCreatedAtDesc(Long userId);

    List<KanjiSrsRecord> findByUserIdAndNextReviewAtLessThanEqualOrderByNextReviewAtAscCreatedAtDesc(Long userId, Instant nextReviewAt);

    Optional<KanjiSrsRecord> findByUserIdAndCharacter(Long userId, String character);

    boolean existsByUserIdAndCharacter(Long userId, String character);
}
