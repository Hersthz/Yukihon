package com.hoang.basis.yukihon.dto.lesson;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private String createdAt;
}
