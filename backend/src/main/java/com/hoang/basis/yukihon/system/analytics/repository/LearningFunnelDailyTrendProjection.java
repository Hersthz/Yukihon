package com.hoang.basis.yukihon.system.analytics.repository;

import java.sql.Date;

public interface LearningFunnelDailyTrendProjection {
    Date getEventDate();

    Long getStartedCount();

    Long getCompletedCount();

    Long getAbandonedCount();

    Long getQuizWrongCount();

    Long getQuizCorrectedCount();
}
