package com.hoang.basis.yukihon.system.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizDto {
    private Long id;
    private String title;
    private String description;
    private String quizType;
    private String difficultyLevel;
    private String jlptLevel;
    private Long lessonId;
    private String question;
    private String options;
    private String correctAnswer;
    private String explanation;
    private String audioUrl;
    private String imageUrl;
}
