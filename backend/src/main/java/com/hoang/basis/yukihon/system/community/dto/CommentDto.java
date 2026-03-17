package com.hoang.basis.yukihon.system.community.dto;

import com.hoang.basis.yukihon.system.community.entity.PostComment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentDto {

    private Long id;
    private Long postId;
    private Long userId;
    private String userDisplayName;
    private String content;
    private Instant createdAt;

    public static CommentDto fromEntity(PostComment comment) {
        return CommentDto.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .userId(comment.getUser().getId())
                .userDisplayName(comment.getUser().getDisplayName())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
