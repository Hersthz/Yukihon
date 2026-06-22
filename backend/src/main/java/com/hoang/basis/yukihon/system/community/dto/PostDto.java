package com.hoang.basis.yukihon.system.community.dto;

import com.hoang.basis.yukihon.system.community.entity.CommunityPost;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostDto {

    private Long id;
    private Long userId;
    private String userDisplayName;
    private String title;
    private String content;
    private String category;
    private String jlptLevel;
    private int likeCount;
    private int commentCount;
    private String imageUrl;
    private boolean likedByCurrentUser;
    private boolean bookmarkedByCurrentUser;
    private List<String> tags;
    private Instant createdAt;
    private Instant updatedAt;

    public static PostDto fromEntity(CommunityPost post, boolean likedByCurrentUser, boolean bookmarkedByCurrentUser) {
        return PostDto.builder()
                .id(post.getId())
                .userId(post.getUser().getId())
                .userDisplayName(post.getUser().getDisplayName())
                .title(post.getTitle())
                .content(post.getContent())
                .category(post.getCategory())
                .jlptLevel(post.getJlptLevel())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .imageUrl(post.getImageUrl())
                .likedByCurrentUser(likedByCurrentUser)
                .bookmarkedByCurrentUser(bookmarkedByCurrentUser)
                .tags(parseTags(post.getTags()))
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    private static List<String> parseTags(String tags) {
        if (tags == null || tags.isBlank()) {
            return List.of();
        }

        return Arrays.stream(tags.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .distinct()
                .collect(Collectors.toList());
    }
}
