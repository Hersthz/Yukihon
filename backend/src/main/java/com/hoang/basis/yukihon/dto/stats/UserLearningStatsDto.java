package com.hoang.basis.yukihon.dto.stats;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserLearningStatsDto {
    private Long id;
    private Long userId;
    private Integer totalXP;
    private Integer currentStreak;
    private Integer longestStreak;
    private String lastLearningDate;
    private Integer lessonsCompleted;
    private Integer quizzesCompleted;
    private Integer vocabularyLearned;
    private Integer grammarLearned;
    private Integer totalLearningMinutes;
    private String targetJLPTLevel;
    private String createdAt;
}
