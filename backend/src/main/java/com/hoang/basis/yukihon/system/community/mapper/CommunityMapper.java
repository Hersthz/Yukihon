package com.hoang.basis.yukihon.system.community.mapper;

import com.hoang.basis.yukihon.system.community.dto.CommentDto;
import com.hoang.basis.yukihon.system.community.dto.PostDto;
import com.hoang.basis.yukihon.system.community.entity.CommunityPost;
import com.hoang.basis.yukihon.system.community.entity.PostComment;
import org.springframework.stereotype.Component;

@Component
public class CommunityMapper {

    public PostDto toPostDto(CommunityPost post, boolean likedByCurrentUser, boolean bookmarkedByCurrentUser) {
        return PostDto.fromEntity(post, likedByCurrentUser, bookmarkedByCurrentUser);
    }

    public CommentDto toCommentDto(PostComment comment) {
        return CommentDto.fromEntity(comment);
    }
}
