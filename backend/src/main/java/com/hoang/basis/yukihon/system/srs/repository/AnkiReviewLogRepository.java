package com.hoang.basis.yukihon.system.srs.repository;

import com.hoang.basis.yukihon.system.srs.entity.AnkiReviewLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnkiReviewLogRepository extends JpaRepository<AnkiReviewLog, Long> {

    /** All review events for a deck, oldest first — the input to a history-replay reschedule. */
    List<AnkiReviewLog> findByUserIdAndDeckIdOrderByReviewedAtAsc(Long userId, Long deckId);
}
