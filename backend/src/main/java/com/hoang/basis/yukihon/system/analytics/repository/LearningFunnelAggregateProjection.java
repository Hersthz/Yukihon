package com.hoang.basis.yukihon.system.analytics.repository;

import com.hoang.basis.yukihon.system.analytics.entity.LearningAnalyticsEvent;
import java.time.Instant;

public interface LearningFunnelAggregateProjection {
    LearningAnalyticsEvent.ContentType getContentType();

    Long getContentId();

    Long getStartedCount();

    Long getCompletedCount();

    Long getAbandonedCount();

    Long getQuizWrongCount();

    Long getQuizCorrectedCount();

    Instant getLastEventAt();
}
