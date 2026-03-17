package com.hoang.basis.yukihon.system.userprogress.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProgressRequest {
    
    private Long lessonId;
    private Long quizId;
    private Long vocabularyId;
    
    @Min(0)
    private Integer score;
    
    @Min(0)
    private Integer totalScore;
    
    private String status;
    private String notes;
}
