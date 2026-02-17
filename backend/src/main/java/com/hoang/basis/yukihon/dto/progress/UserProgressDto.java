package com.hoang.basis.yukihon.dto.progress;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProgressDto {
    private Long id;
    private Long userId;
    private Long lessonId;
    private Long quizId;
    private Long vocabularyId;
    private String status;
    private String progressType;
    private Integer score;
    private Integer totalScore;
    private Integer attemptCount;
    private String notes;
    private String createdAt;
    private String completedAt;
}
