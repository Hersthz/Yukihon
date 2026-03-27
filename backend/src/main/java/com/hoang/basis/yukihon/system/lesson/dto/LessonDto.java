package com.hoang.basis.yukihon.system.lesson.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonDto {
    private Long id;
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
    private String createdAt;
}
