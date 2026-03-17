package com.hoang.basis.yukihon.system.translation.controller;

import com.hoang.basis.yukihon.system.translation.dto.TranslateRequest;
import com.hoang.basis.yukihon.system.translation.dto.TranslateResponse;
import com.hoang.basis.yukihon.system.translation.dto.TranslationHistoryDto;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import com.hoang.basis.yukihon.system.translation.service.TranslationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/translation")
@RequiredArgsConstructor
@Slf4j
public class TranslationController {

    private final TranslationService translationService;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    /**
     * Dịch văn bản — proxy qua backend, lưu lịch sử
     */
    @PostMapping("/translate")
    public ResponseEntity<TranslateResponse> translate(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TranslateRequest request
    ) {
        Long userId = getUserId(userDetails);
        log.info("User {} requested translation: {} → {}", userId, request.getSourceLang(), request.getTargetLang());
        return ResponseEntity.ok(translationService.translate(userId, request));
    }

    /**
     * Lấy lịch sử dịch (phân trang, mới nhất trước)
     */
    @GetMapping("/history")
    public ResponseEntity<Page<TranslationHistoryDto>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(translationService.getHistory(userId, pageable));
    }

    /**
     * Lấy danh sách bản dịch đã bookmark
     */
    @GetMapping("/bookmarks")
    public ResponseEntity<List<TranslationHistoryDto>> getBookmarks(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(translationService.getBookmarks(userId));
    }

    /**
     * Toggle bookmark cho một bản dịch
     */
    @PostMapping("/history/{historyId}/bookmark")
    public ResponseEntity<TranslationHistoryDto> toggleBookmark(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long historyId
    ) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(translationService.toggleBookmark(userId, historyId));
    }

    /**
     * Xoá một bản dịch khỏi lịch sử
     */
    @DeleteMapping("/history/{historyId}")
    public ResponseEntity<Void> deleteHistoryItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long historyId
    ) {
        Long userId = getUserId(userDetails);
        translationService.deleteHistoryItem(userId, historyId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Xoá toàn bộ lịch sử dịch
     */
    @DeleteMapping("/history")
    public ResponseEntity<Void> clearAllHistory(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = getUserId(userDetails);
        translationService.clearAllHistory(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Thống kê dịch thuật của user
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(translationService.getStats(userId));
    }
}
