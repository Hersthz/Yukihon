package com.hoang.basis.yukihon.system.analytics.repository;

import com.hoang.basis.yukihon.system.analytics.entity.LearningAnalyticsEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface LearningAnalyticsEventRepository extends JpaRepository<LearningAnalyticsEvent, Long> {

    @Query("""
            SELECT
                e.contentType AS contentType,
                e.contentId AS contentId,
                SUM(CASE WHEN e.eventType = :startEvent THEN 1 ELSE 0 END) AS startedCount,
                SUM(CASE WHEN e.eventType = :completeEvent THEN 1 ELSE 0 END) AS completedCount,
                SUM(CASE WHEN e.eventType = :abandonEvent THEN 1 ELSE 0 END) AS abandonedCount,
                SUM(CASE WHEN e.eventType = :quizWrongEvent THEN 1 ELSE 0 END) AS quizWrongCount,
                SUM(CASE WHEN e.eventType = :quizCorrectedEvent THEN 1 ELSE 0 END) AS quizCorrectedCount,
                MAX(e.createdAt) AS lastEventAt
            FROM LearningAnalyticsEvent e
            WHERE (:since IS NULL OR e.createdAt >= :since)
              AND (:until IS NULL OR e.createdAt < :until)
              AND (:contentType IS NULL OR e.contentType = :contentType)
              AND (:jlptLevel IS NULL OR UPPER(e.jlptLevel) = :jlptLevel)
            GROUP BY e.contentType, e.contentId
            """)
    List<LearningFunnelAggregateProjection> aggregateFunnel(
            @Param("since") Instant since,
            @Param("until") Instant until,
            @Param("contentType") LearningAnalyticsEvent.ContentType contentType,
            @Param("jlptLevel") String jlptLevel,
            @Param("startEvent") LearningAnalyticsEvent.EventType startEvent,
            @Param("completeEvent") LearningAnalyticsEvent.EventType completeEvent,
            @Param("abandonEvent") LearningAnalyticsEvent.EventType abandonEvent,
            @Param("quizWrongEvent") LearningAnalyticsEvent.EventType quizWrongEvent,
            @Param("quizCorrectedEvent") LearningAnalyticsEvent.EventType quizCorrectedEvent
    );
}
