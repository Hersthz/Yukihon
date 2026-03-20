package com.hoang.basis.yukihon.system.community.service;

import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import com.hoang.basis.yukihon.system.community.dto.CommentDto;
import com.hoang.basis.yukihon.system.community.dto.CreateCommentRequest;
import com.hoang.basis.yukihon.system.community.dto.CreatePostRequest;
import com.hoang.basis.yukihon.system.community.dto.PostDto;
import com.hoang.basis.yukihon.system.community.entity.CommunityPost;
import com.hoang.basis.yukihon.system.community.entity.PostComment;
import com.hoang.basis.yukihon.system.community.entity.PostLike;
import com.hoang.basis.yukihon.system.community.repository.CommunityPostRepository;
import com.hoang.basis.yukihon.system.community.repository.PostCommentRepository;
import com.hoang.basis.yukihon.system.community.repository.PostLikeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommunityService {

    private final CommunityPostRepository postRepository;
    private final PostCommentRepository commentRepository;
    private final PostLikeRepository likeRepository;
    private final UserRepository userRepository;

    // ==================== POSTS ====================

    public Page<PostDto> getAllPosts(Long currentUserId, Pageable pageable) {
        Page<CommunityPost> posts = postRepository.findAllByOrderByCreatedAtDesc(pageable);
        Set<Long> likedPostIds = findLikedPostIds(posts, currentUserId);

        return posts.map(post -> PostDto.fromEntity(post, likedPostIds.contains(post.getId())));
    }

    public Page<PostDto> getPostsByCategory(String category, Long currentUserId, Pageable pageable) {
        Page<CommunityPost> posts = postRepository.findByCategoryOrderByCreatedAtDesc(category, pageable);
        Set<Long> likedPostIds = findLikedPostIds(posts, currentUserId);

        return posts.map(post -> PostDto.fromEntity(post, likedPostIds.contains(post.getId())));
    }

    public Page<PostDto> getPostsByUser(Long userId, Long currentUserId, Pageable pageable) {
        Page<CommunityPost> posts = postRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        Set<Long> likedPostIds = findLikedPostIds(posts, currentUserId);

        return posts.map(post -> PostDto.fromEntity(post, likedPostIds.contains(post.getId())));
    }

    public PostDto getPostById(Long postId, Long currentUserId) {
        CommunityPost post = findPostByIdOrThrow(postId);
        return PostDto.fromEntity(post,
                likeRepository.existsByPostIdAndUserId(postId, currentUserId));
    }

    private Set<Long> findLikedPostIds(Page<CommunityPost> posts, Long currentUserId) {
        if (currentUserId == null || posts.isEmpty()) {
            return Collections.emptySet();
        }

        Set<Long> postIds = posts.stream().map(CommunityPost::getId).collect(java.util.stream.Collectors.toSet());
        if (postIds.isEmpty()) {
            return Collections.emptySet();
        }

        return new HashSet<>(likeRepository.findLikedPostIdsByUserIdAndPostIds(currentUserId, postIds));
    }

    @Transactional
    public PostDto createPost(Long userId, CreatePostRequest request) {
        User user = findUserByIdOrThrow(userId);

        CommunityPost post = CommunityPost.builder()
                .user(user)
                .content(request.getContent())
                .category(request.getCategory() != null ? request.getCategory() : "GENERAL")
                .jlptLevel(request.getJlptLevel())
                .imageUrl(request.getImageUrl())
                .build();

        CommunityPost saved = postRepository.save(post);
        log.info("User {} created post {}", userId, saved.getId());
        return PostDto.fromEntity(saved, false);
    }

    @Transactional
    public void deletePost(Long postId, Long userId) {
        CommunityPost post = findPostByIdOrThrow(postId);

        if (!post.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own posts");
        }

        postRepository.delete(post);
        log.info("User {} deleted post {}", userId, postId);
    }

    // ==================== LIKES ====================

    @Transactional
    public PostDto toggleLike(Long postId, Long userId) {
        CommunityPost post = findPostByIdOrThrow(postId);
        User user = findUserByIdOrThrow(userId);

        var existingLike = likeRepository.findByPostIdAndUserId(postId, userId);

        if (existingLike.isPresent()) {
            likeRepository.delete(existingLike.get());
            post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
            postRepository.save(post);
            return PostDto.fromEntity(post, false);
        } else {
            PostLike like = PostLike.builder()
                    .post(post)
                    .user(user)
                    .build();
            likeRepository.save(like);
            post.setLikeCount(post.getLikeCount() + 1);
            postRepository.save(post);
            return PostDto.fromEntity(post, true);
        }
    }

    // ==================== COMMENTS ====================

    public Page<CommentDto> getComments(Long postId, Pageable pageable) {
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId, pageable)
                .map(CommentDto::fromEntity);
    }

    @Transactional
    public CommentDto addComment(Long postId, Long userId, CreateCommentRequest request) {
        CommunityPost post = findPostByIdOrThrow(postId);
        User user = findUserByIdOrThrow(userId);

        PostComment comment = PostComment.builder()
                .post(post)
                .user(user)
                .content(request.getContent())
                .build();

        PostComment saved = commentRepository.save(comment);
        post.setCommentCount(post.getCommentCount() + 1);
        postRepository.save(post);

        log.info("User {} commented on post {}", userId, postId);
        return CommentDto.fromEntity(saved);
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        PostComment comment = findCommentByIdOrThrow(commentId);

        if (!comment.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own comments");
        }

        CommunityPost post = comment.getPost();
        post.setCommentCount(Math.max(0, post.getCommentCount() - 1));
        postRepository.save(post);
        commentRepository.delete(comment);

        log.info("User {} deleted comment {} from post {}", userId, commentId, post.getId());
    }

    private CommunityPost findPostByIdOrThrow(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
    }

    private User findUserByIdOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private PostComment findCommentByIdOrThrow(Long commentId) {
        return commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
    }
}
