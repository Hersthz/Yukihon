package com.hoang.basis.yukihon.system.community.service;

import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.community.dto.CommunityLeaderboardEntryDto;
import com.hoang.basis.yukihon.system.community.dto.CommunityStatsDto;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import com.hoang.basis.yukihon.system.community.dto.CommentDto;
import com.hoang.basis.yukihon.system.community.dto.CreateCommentRequest;
import com.hoang.basis.yukihon.system.community.dto.CreatePostRequest;
import com.hoang.basis.yukihon.system.community.dto.PostDto;
import com.hoang.basis.yukihon.system.community.entity.CommunityPost;
import com.hoang.basis.yukihon.system.community.entity.PostBookmark;
import com.hoang.basis.yukihon.system.community.entity.PostComment;
import com.hoang.basis.yukihon.system.community.entity.PostLike;
import com.hoang.basis.yukihon.system.community.repository.PostBookmarkRepository;
import com.hoang.basis.yukihon.system.community.repository.CommunityPostRepository;
import com.hoang.basis.yukihon.system.community.repository.PostCommentRepository;
import com.hoang.basis.yukihon.system.community.repository.PostLikeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CommunityService {

    private final CommunityPostRepository postRepository;
    private final PostCommentRepository commentRepository;
    private final PostLikeRepository likeRepository;
    private final PostBookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;

    // ==================== POSTS ====================

    public Page<PostDto> getAllPosts(Long currentUserId, Pageable pageable) {
        Page<CommunityPost> posts = postRepository.findAllByOrderByCreatedAtDesc(pageable);
        Set<Long> likedPostIds = findLikedPostIds(posts, currentUserId);
        Set<Long> bookmarkedPostIds = findBookmarkedPostIds(posts, currentUserId);

        return posts.map(post -> PostDto.fromEntity(
                post,
                likedPostIds.contains(post.getId()),
                bookmarkedPostIds.contains(post.getId())
        ));
    }

    public Page<PostDto> getPostsByCategory(String category, Long currentUserId, Pageable pageable) {
        Page<CommunityPost> posts = postRepository.findByCategoryOrderByCreatedAtDesc(category, pageable);
        Set<Long> likedPostIds = findLikedPostIds(posts, currentUserId);
        Set<Long> bookmarkedPostIds = findBookmarkedPostIds(posts, currentUserId);

        return posts.map(post -> PostDto.fromEntity(
                post,
                likedPostIds.contains(post.getId()),
                bookmarkedPostIds.contains(post.getId())
        ));
    }

    public Page<PostDto> searchPosts(String category, String jlptLevel, String search, boolean bookmarkedOnly, Long currentUserId, Pageable pageable) {
        String normalizedCategory = normalizeOptional(category);
        String normalizedJlptLevel = normalizeOptional(jlptLevel);
        String normalizedSearch = normalizeOptional(search);

        Page<CommunityPost> posts = bookmarkedOnly
                ? postRepository.findBookmarkedPostsByUserId(currentUserId, normalizedCategory, normalizedJlptLevel, normalizedSearch, pageable)
                : postRepository.searchPosts(normalizedCategory, normalizedJlptLevel, normalizedSearch, pageable);
        Set<Long> likedPostIds = findLikedPostIds(posts, currentUserId);
        Set<Long> bookmarkedPostIds = findBookmarkedPostIds(posts, currentUserId);

        return posts.map(post -> PostDto.fromEntity(
                post,
                likedPostIds.contains(post.getId()),
                bookmarkedPostIds.contains(post.getId())
        ));
    }

    public Page<PostDto> getPostsByUser(Long userId, Long currentUserId, Pageable pageable) {
        Page<CommunityPost> posts = postRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        Set<Long> likedPostIds = findLikedPostIds(posts, currentUserId);
        Set<Long> bookmarkedPostIds = findBookmarkedPostIds(posts, currentUserId);

        return posts.map(post -> PostDto.fromEntity(
                post,
                likedPostIds.contains(post.getId()),
                bookmarkedPostIds.contains(post.getId())
        ));
    }

    public PostDto getPostById(Long postId, Long currentUserId) {
        CommunityPost post = findPostByIdOrThrow(postId);
        return PostDto.fromEntity(post,
                likeRepository.existsByPostIdAndUserId(postId, currentUserId),
                bookmarkRepository.existsByPostIdAndUserId(postId, currentUserId));
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

    private Set<Long> findBookmarkedPostIds(Page<CommunityPost> posts, Long currentUserId) {
        if (currentUserId == null || posts.isEmpty()) {
            return Collections.emptySet();
        }

        Set<Long> postIds = posts.stream().map(CommunityPost::getId).collect(Collectors.toSet());
        if (postIds.isEmpty()) {
            return Collections.emptySet();
        }

        return new HashSet<>(bookmarkRepository.findBookmarkedPostIdsByUserIdAndPostIds(currentUserId, postIds));
    }

    @Transactional
    public PostDto createPost(Long userId, CreatePostRequest request) {
        User user = findUserByIdOrThrow(userId);

        CommunityPost post = CommunityPost.builder()
                .user(user)
                .title(normalizeOptional(request.getTitle()))
                .content(request.getContent())
                .category(request.getCategory() != null ? request.getCategory() : "GENERAL")
                .jlptLevel(request.getJlptLevel())
                .imageUrl(request.getImageUrl())
                .tags(normalizeTags(request.getTags()))
                .build();

        CommunityPost saved = postRepository.save(post);
        log.info("User {} created post {}", userId, saved.getId());
        return PostDto.fromEntity(saved, false, false);
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
            return PostDto.fromEntity(post, false, bookmarkRepository.existsByPostIdAndUserId(postId, userId));
        } else {
            PostLike like = PostLike.builder()
                    .post(post)
                    .user(user)
                    .build();
            likeRepository.save(like);
            post.setLikeCount(post.getLikeCount() + 1);
            postRepository.save(post);
            return PostDto.fromEntity(post, true, bookmarkRepository.existsByPostIdAndUserId(postId, userId));
        }
    }

    @Transactional
    public PostDto toggleBookmark(Long postId, Long userId) {
        CommunityPost post = findPostByIdOrThrow(postId);
        User user = findUserByIdOrThrow(userId);

        var existingBookmark = bookmarkRepository.findByPostIdAndUserId(postId, userId);
        if (existingBookmark.isPresent()) {
            bookmarkRepository.delete(existingBookmark.get());
            return PostDto.fromEntity(post, likeRepository.existsByPostIdAndUserId(postId, userId), false);
        }

        PostBookmark bookmark = PostBookmark.builder()
                .post(post)
                .user(user)
                .build();
        bookmarkRepository.save(bookmark);
        return PostDto.fromEntity(post, likeRepository.existsByPostIdAndUserId(postId, userId), true);
    }

    public CommunityStatsDto getStats() {
        List<CommunityPost> posts = postRepository.findAll();
        List<PostComment> comments = commentRepository.findAll();
        Instant oneWeekAgo = Instant.now().minus(7, ChronoUnit.DAYS);

        long totalContributors = posts.stream()
                .map(post -> post.getUser().getId())
                .distinct()
                .count();

        Map<String, Long> tagCounts = posts.stream()
                .map(CommunityPost::getTags)
                .filter(tags -> tags != null && !tags.isBlank())
                .flatMap(tags -> List.of(tags.split(",")).stream())
                .map(String::trim)
                .map(tag -> tag.toLowerCase(Locale.ROOT))
                .filter(tag -> !tag.isBlank())
                .collect(Collectors.groupingBy(tag -> tag, Collectors.counting()));

        List<String> trendingTags = tagCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(entry -> "#" + entry.getKey())
                .toList();

        return CommunityStatsDto.builder()
                .totalPosts(posts.size())
                .totalComments(comments.size())
                .totalContributors(totalContributors)
                .postsThisWeek(posts.stream().filter(post -> post.getCreatedAt().isAfter(oneWeekAgo)).count())
                .questionsCount(posts.stream().filter(post -> "QUESTION".equalsIgnoreCase(post.getCategory())).count())
                .resourcesCount(posts.stream().filter(post -> "RESOURCE".equalsIgnoreCase(post.getCategory())).count())
                .trendingTags(trendingTags)
                .build();
    }

    public List<CommunityLeaderboardEntryDto> getLeaderboard() {
        List<CommunityPost> posts = postRepository.findAll();
        List<PostComment> comments = commentRepository.findAll();

        Map<Long, LeaderboardAccumulator> scores = new HashMap<>();

        for (CommunityPost post : posts) {
            scores.computeIfAbsent(post.getUser().getId(), ignored -> new LeaderboardAccumulator(post.getUser().getDisplayName()))
                    .postsCount++;
            scores.get(post.getUser().getId()).likesReceived += post.getLikeCount();
            scores.get(post.getUser().getId()).commentsReceived += post.getCommentCount();
        }

        for (PostComment comment : comments) {
            scores.computeIfAbsent(comment.getUser().getId(), ignored -> new LeaderboardAccumulator(comment.getUser().getDisplayName()))
                    .commentsCount++;
        }

        return scores.entrySet().stream()
                .map(entry -> CommunityLeaderboardEntryDto.builder()
                        .userId(entry.getKey())
                        .userDisplayName(entry.getValue().displayName)
                        .postsCount(entry.getValue().postsCount)
                        .commentsCount(entry.getValue().commentsCount)
                        .likesReceived(entry.getValue().likesReceived)
                        .score(entry.getValue().score())
                        .build())
                .sorted(Comparator.comparingLong(CommunityLeaderboardEntryDto::getScore).reversed())
                .limit(5)
                .toList();
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

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String normalizeTags(String tags) {
        if (tags == null || tags.isBlank()) {
            return null;
        }

        return List.of(tags.split(",")).stream()
                .map(String::trim)
                .filter(tag -> !tag.isBlank())
                .distinct()
                .limit(6)
                .collect(Collectors.joining(","));
    }

    private static final class LeaderboardAccumulator {
        private final String displayName;
        private long postsCount;
        private long commentsCount;
        private long likesReceived;
        private long commentsReceived;

        private LeaderboardAccumulator(String displayName) {
            this.displayName = displayName;
        }

        private long score() {
            return postsCount * 5 + commentsCount * 3 + likesReceived * 2 + commentsReceived;
        }
    }
}
