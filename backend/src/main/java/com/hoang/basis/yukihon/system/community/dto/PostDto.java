package com.hoang.basis.yukihon.system.community.dto;

import com.hoang.basis.yukihon.system.community.entity.CommunityPost;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostDto {

    private Long id;
    private Long userId;
    private String userDisplayName;
    private String content;
    private String category;
    private String jlptLevel;
    private int likeCount;
    private int commentCount;
    private String imageUrl;
    private boolean likedByCurrentUser;
    private Instant createdAt;
    private Instant updatedAt;

    public static PostDto fromEntity(CommunityPost post, boolean likedByCurrentUser) {
        return PostDto.builder()
                .id(post.getId())
                .userId(post.getUser().getId())
                .userDisplayName(post.getUser().getDisplayName())
                .content(post.getContent())
                .category(post.getCategory())
                .jlptLevel(post.getJlptLevel())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .imageUrl(post.getImageUrl())
                .likedByCurrentUser(likedByCurrentUser)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
