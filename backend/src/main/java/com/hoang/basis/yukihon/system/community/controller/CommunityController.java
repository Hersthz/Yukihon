package com.hoang.basis.yukihon.system.community.controller;

import com.hoang.basis.yukihon.base.security.CurrentUserId;
import com.hoang.basis.yukihon.system.community.dto.*;
import com.hoang.basis.yukihon.system.community.service.CommunityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    @GetMapping("/posts")
    public ResponseEntity<Page<PostDto>> getAllPosts(
            @CurrentUserId Long userId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String jlptLevel,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "false") boolean bookmarkedOnly,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        if ((category != null && !category.isEmpty())
                || (jlptLevel != null && !jlptLevel.isEmpty())
                || (search != null && !search.isEmpty())
                || bookmarkedOnly) {
            return ResponseEntity.ok(
                    communityService.searchPosts(category, jlptLevel, search, bookmarkedOnly, userId, pageable));
        }
        return ResponseEntity.ok(communityService.getAllPosts(userId, pageable));
    }

    @GetMapping("/posts/{postId}")
    public ResponseEntity<PostDto> getPost(@PathVariable Long postId, @CurrentUserId Long userId) {
        return ResponseEntity.ok(communityService.getPostById(postId, userId));
    }

    @GetMapping("/posts/user/{userId}")
    public ResponseEntity<Page<PostDto>> getUserPosts(
            @PathVariable Long userId,
            @CurrentUserId Long currentUserId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(communityService.getPostsByUser(userId, currentUserId, pageable));
    }

    @PostMapping("/posts")
    public ResponseEntity<PostDto> createPost(
            @CurrentUserId Long userId, @Valid @RequestBody CreatePostRequest request) {
        return ResponseEntity.ok(communityService.createPost(userId, request));
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId, @CurrentUserId Long userId) {
        communityService.deletePost(postId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<PostDto> toggleLike(@PathVariable Long postId, @CurrentUserId Long userId) {
        return ResponseEntity.ok(communityService.toggleLike(postId, userId));
    }

    @PostMapping("/posts/{postId}/bookmark")
    public ResponseEntity<PostDto> toggleBookmark(@PathVariable Long postId, @CurrentUserId Long userId) {
        return ResponseEntity.ok(communityService.toggleBookmark(postId, userId));
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<Page<CommentDto>> getComments(
            @PathVariable Long postId, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(communityService.getComments(postId, pageable));
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentDto> addComment(
            @PathVariable Long postId, @CurrentUserId Long userId, @Valid @RequestBody CreateCommentRequest request) {
        return ResponseEntity.ok(communityService.addComment(postId, userId, request));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId, @CurrentUserId Long userId) {
        communityService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<CommunityStatsDto> getStats() {
        return ResponseEntity.ok(communityService.getStats());
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<java.util.List<CommunityLeaderboardEntryDto>> getLeaderboard() {
        return ResponseEntity.ok(communityService.getLeaderboard());
    }
}
