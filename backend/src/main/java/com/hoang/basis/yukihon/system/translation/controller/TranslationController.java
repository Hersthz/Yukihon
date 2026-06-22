package com.hoang.basis.yukihon.system.translation.controller;

import com.hoang.basis.yukihon.base.security.CurrentUserId;
import com.hoang.basis.yukihon.system.translation.dto.TranslateRequest;
import com.hoang.basis.yukihon.system.translation.dto.TranslateResponse;
import com.hoang.basis.yukihon.system.translation.dto.TranslationHistoryDto;
import com.hoang.basis.yukihon.system.translation.service.TranslationService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/translation")
@RequiredArgsConstructor
@Slf4j
public class TranslationController {

    private final TranslationService translationService;

    /** Dịch văn bản — proxy qua backend, lưu lịch sử */
    @PostMapping("/translate")
    public ResponseEntity<TranslateResponse> translate(
            @CurrentUserId Long userId, @Valid @RequestBody TranslateRequest request) {
        log.info("User {} requested translation: {} → {}", userId, request.getSourceLang(), request.getTargetLang());
        return ResponseEntity.ok(translationService.translate(userId, request));
    }

    /** Lấy lịch sử dịch (phân trang, mới nhất trước) */
    @GetMapping("/history")
    public ResponseEntity<Page<TranslationHistoryDto>> getHistory(
            @CurrentUserId Long userId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(translationService.getHistory(userId, pageable));
    }

    /** Lấy danh sách bản dịch đã bookmark */
    @GetMapping("/bookmarks")
    public ResponseEntity<List<TranslationHistoryDto>> getBookmarks(@CurrentUserId Long userId) {
        return ResponseEntity.ok(translationService.getBookmarks(userId));
    }

    /** Toggle bookmark cho một bản dịch */
    @PostMapping("/history/{historyId}/bookmark")
    public ResponseEntity<TranslationHistoryDto> toggleBookmark(
            @CurrentUserId Long userId, @PathVariable Long historyId) {
        return ResponseEntity.ok(translationService.toggleBookmark(userId, historyId));
    }

    /** Xoá một bản dịch khỏi lịch sử */
    @DeleteMapping("/history/{historyId}")
    public ResponseEntity<Void> deleteHistoryItem(@CurrentUserId Long userId, @PathVariable Long historyId) {
        translationService.deleteHistoryItem(userId, historyId);
        return ResponseEntity.noContent().build();
    }

    /** Xoá toàn bộ lịch sử dịch */
    @DeleteMapping("/history")
    public ResponseEntity<Void> clearAllHistory(@CurrentUserId Long userId) {
        translationService.clearAllHistory(userId);
        return ResponseEntity.noContent().build();
    }

    /** Thống kê dịch thuật của user */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(@CurrentUserId Long userId) {
        return ResponseEntity.ok(translationService.getStats(userId));
    }
}
