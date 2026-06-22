package com.hoang.basis.yukihon.system.learningpath.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningPathDto {
    private String targetJlptLevel;
    private int dailyGoalMinutes;
    private LearningDeadlinePlanDto deadlinePlan;
    private int totalLessonsInTrack;
    private int completedLessonsInTrack;
    private int inProgressLessons;
    private int completionRate;
    private int currentStreak;
    private int totalXP;
    private LearningPathLessonDto nextLesson;
    private List<LearningPathLessonDto> recommendedLessons;
    private List<String> todayGoals;
    private String recommendationSummary;
}
