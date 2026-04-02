package com.hoang.basis.yukihon.system.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyCalendarDto {
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate todayDate;
    private int currentStreak;
    private int longestStreak;
    private LocalDate lastLearningDate;
    private int dailyGoalMinutes;
    private String targetJlptLevel;
    private LocalDate deadlineDate;
    private String deadlineStatus;
    private String deadlineInsight;
    private LocalDate projectedCompletionDate;
    private int daysRemainingToDeadline;
    private int recommendedMinutesPerDay;
    private int requiredLessonsPerWeek;
    private int activeDays;
    private long totalStudyEvents;
    private long totalStudyMinutes;
    private LocalDate bestDayDate;
    private long bestDayMinutes;
    private List<LocalDate> recommendedStudyDates;
    private List<StudyCalendarDayDto> days;
}
