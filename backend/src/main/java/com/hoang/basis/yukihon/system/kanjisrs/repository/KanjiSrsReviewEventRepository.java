package com.hoang.basis.yukihon.system.kanjisrs.repository;

import com.hoang.basis.yukihon.system.kanjisrs.entity.KanjiSrsReviewEvent;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KanjiSrsReviewEventRepository extends JpaRepository<KanjiSrsReviewEvent, Long> {

    List<KanjiSrsReviewEvent> findByUserIdAndReviewedAtBetweenOrderByReviewedAtAsc(
            Long userId, Instant start, Instant end);
}
