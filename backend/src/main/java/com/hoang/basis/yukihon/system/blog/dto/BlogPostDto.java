package com.hoang.basis.yukihon.system.blog.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogPostDto {
    private Long id;
    private String title;
    private String slug;
    private String excerpt;
    private String content;
    private String coverImageUrl;
    private List<String> tags;
    private String authorName;
    private String status;
    private String publishedAt;
    private String createdAt;
    private String updatedAt;
}
