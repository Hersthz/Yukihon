package com.hoang.basis.yukihon.system.learningpath.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningPathLessonDto {
    private Long id;
    private String title;
    private String description;
    private String jlptLevel;
    private String category;
    private Integer orderIndex;
    private String progressStatus;
    private Integer progressPercent;
    private Integer estimatedMinutes;
    private String recommendationReason;
}
