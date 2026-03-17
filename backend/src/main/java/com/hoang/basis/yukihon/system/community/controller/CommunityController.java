package com.hoang.basis.yukihon.system.community.controller;

import com.hoang.basis.yukihon.system.community.dto.*;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import com.hoang.basis.yukihon.system.community.service.CommunityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    @GetMapping("/posts")
    public ResponseEntity<Page<PostDto>> getAllPosts(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String category,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Long userId = getUserId(userDetails);
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(communityService.getPostsByCategory(category, userId, pageable));
        }
        return ResponseEntity.ok(communityService.getAllPosts(userId, pageable));
    }

    @GetMapping("/posts/{postId}")
    public ResponseEntity<PostDto> getPost(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(communityService.getPostById(postId, userId));
    }

    @GetMapping("/posts/user/{userId}")
    public ResponseEntity<Page<PostDto>> getUserPosts(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Long currentUserId = getUserId(userDetails);
        return ResponseEntity.ok(communityService.getPostsByUser(userId, currentUserId, pageable));
    }

    @PostMapping("/posts")
    public ResponseEntity<PostDto> createPost(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreatePostRequest request
    ) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(communityService.createPost(userId, request));
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = getUserId(userDetails);
        communityService.deletePost(postId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<PostDto> toggleLike(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(communityService.toggleLike(postId, userId));
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<Page<CommentDto>> getComments(
            @PathVariable Long postId,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(communityService.getComments(postId, pageable));
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentDto> addComment(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateCommentRequest request
    ) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(communityService.addComment(postId, userId, request));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = getUserId(userDetails);
        communityService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }
}
