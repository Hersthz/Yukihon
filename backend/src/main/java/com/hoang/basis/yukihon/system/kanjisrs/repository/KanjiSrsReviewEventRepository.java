package com.hoang.basis.yukihon.system.kanjisrs.repository;

import com.hoang.basis.yukihon.system.kanjisrs.entity.KanjiSrsReviewEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface KanjiSrsReviewEventRepository extends JpaRepository<KanjiSrsReviewEvent, Long> {

    List<KanjiSrsReviewEvent> findByUserIdAndReviewedAtBetweenOrderByReviewedAtAsc(Long userId, Instant start, Instant end);
}
