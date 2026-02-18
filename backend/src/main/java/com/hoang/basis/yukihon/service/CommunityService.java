package com.hoang.basis.yukihon.service;

import com.hoang.basis.yukihon.dto.community.*;
import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.model.*;
import com.hoang.basis.yukihon.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        return postRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(post -> PostDto.fromEntity(post,
                        likeRepository.existsByPostIdAndUserId(post.getId(), currentUserId)));
    }

    public Page<PostDto> getPostsByCategory(String category, Long currentUserId, Pageable pageable) {
        return postRepository.findByCategoryOrderByCreatedAtDesc(category, pageable)
                .map(post -> PostDto.fromEntity(post,
                        likeRepository.existsByPostIdAndUserId(post.getId(), currentUserId)));
    }

    public Page<PostDto> getPostsByUser(Long userId, Long currentUserId, Pageable pageable) {
        return postRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(post -> PostDto.fromEntity(post,
                        likeRepository.existsByPostIdAndUserId(post.getId(), currentUserId)));
    }

    public PostDto getPostById(Long postId, Long currentUserId) {
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        return PostDto.fromEntity(post,
                likeRepository.existsByPostIdAndUserId(postId, currentUserId));
    }

    @Transactional
    public PostDto createPost(Long userId, CreatePostRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

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
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        if (!post.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own posts");
        }

        postRepository.delete(post);
        log.info("User {} deleted post {}", userId, postId);
    }

    // ==================== LIKES ====================

    @Transactional
    public PostDto toggleLike(Long postId, Long userId) {
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

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
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

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
        PostComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!comment.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own comments");
        }

        CommunityPost post = comment.getPost();
        post.setCommentCount(Math.max(0, post.getCommentCount() - 1));
        postRepository.save(post);
        commentRepository.delete(comment);

        log.info("User {} deleted comment {} from post {}", userId, commentId, post.getId());
    }
}
