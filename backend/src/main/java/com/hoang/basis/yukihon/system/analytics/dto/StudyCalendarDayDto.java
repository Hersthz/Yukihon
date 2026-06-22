package com.hoang.basis.yukihon.system.analytics.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyCalendarDayDto {
    private LocalDate date;
    private boolean hasActivity;
    private boolean isToday;
    private boolean isDeadlineDay;
    private boolean isRecommendedStudyDay;
    private long totalEvents;
    private long startedCount;
    private long completedCount;
    private long totalMinutes;
    private String intensity;
}
