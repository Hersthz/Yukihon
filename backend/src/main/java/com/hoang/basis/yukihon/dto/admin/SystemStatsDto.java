package com.hoang.basis.yukihon.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemStatsDto {

    private long totalUsers;
    private long activeUsers;
    private long adminUsers;
    private long totalLessons;
    private long totalVocabulary;
    private long totalGrammar;
    private long totalQuizzes;
}
