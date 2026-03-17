package com.hoang.basis.yukihon.system.community.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePostRequest {

    @NotBlank(message = "Content is required")
    @Size(max = 5000, message = "Content must be under 5000 characters")
    private String content;

    private String category; // GENERAL, QUESTION, TIP, RESOURCE, ACHIEVEMENT

    private String jlptLevel;

    private String imageUrl;
}
