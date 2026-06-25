package com.hoang.basis.yukihon.system.blog.dto;

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
public class BlogPostRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 300)
    private String title;

    private String slug;
    private String excerpt;
    private String content;
    private String coverImageUrl;
    private List<String> tags;
    private String authorName;
    private String status;
}
