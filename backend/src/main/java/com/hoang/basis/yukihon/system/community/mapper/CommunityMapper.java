package com.hoang.basis.yukihon.system.community.mapper;

import com.hoang.basis.yukihon.system.community.dto.CommentDto;
import com.hoang.basis.yukihon.system.community.dto.PostDto;
import com.hoang.basis.yukihon.system.community.entity.PostComment;
import com.hoang.basis.yukihon.system.community.entity.CommunityPost;
import org.springframework.stereotype.Component;

@Component
public class CommunityMapper {

    public PostDto toPostDto(CommunityPost post, boolean likedByCurrentUser) {
        return PostDto.fromEntity(post, likedByCurrentUser);
    }

    public CommentDto toCommentDto(PostComment comment) {
        return CommentDto.fromEntity(comment);
    }
}
