package com.hoang.basis.yukihon.system.lesson.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 200)
    private String title;

    private String description;
    private String content;
    private String jlptLevel;
    private String category;
    private String status;
    private Integer orderIndex;
    private String audioUrl;
    private String videoUrl;
    private String imageUrl;
    private List<Long> relatedVocabularyIds;
    private List<Long> relatedGrammarIds;
    private List<Long> relatedQuizIds;
}
