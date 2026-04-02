package com.hoang.basis.yukihon.system.analytics.repository;

import java.sql.Date;

public interface StudyCalendarDayProjection {
    Date getEventDate();

    Long getTotalEvents();

    Long getStartedCount();

    Long getCompletedCount();

    Long getTotalDurationSeconds();
}
