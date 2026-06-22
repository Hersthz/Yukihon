package com.hoang.basis.yukihon.system.learningpath.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningDeadlinePlanDto {
    private boolean hasDeadline;
    private String planStatus;
    private LocalDate deadlineDate;
    private LocalDate projectedCompletionDate;
    private int daysRemaining;
    private int remainingLessons;
    private int remainingEstimatedMinutes;
    private int requiredMinutesPerDay;
    private int requiredLessonsPerWeek;
    private String insight;
}
