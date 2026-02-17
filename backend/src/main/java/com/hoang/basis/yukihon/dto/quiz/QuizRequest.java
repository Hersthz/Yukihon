package com.hoang.basis.yukihon.dto.quiz;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizRequest {
    
    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 200)
    private String title;
    
    private String description;
    private String quizType;
    private String difficultyLevel;
    private String jlptLevel;
    
    @NotBlank(message = "Question is required")
    private String question;
    
    private String options;
    
    @NotBlank(message = "Correct answer is required")
    private String correctAnswer;
    
    private String explanation;
    private String audioUrl;
    private String imageUrl;
}
