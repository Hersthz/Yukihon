package com.hoang.basis.yukihon.system.savedword.controller;

import com.hoang.basis.yukihon.base.security.CurrentUserId;
import com.hoang.basis.yukihon.system.savedword.dto.ReviewSavedWordRequest;
import com.hoang.basis.yukihon.system.savedword.dto.SaveWordRequest;
import com.hoang.basis.yukihon.system.savedword.dto.SavedWordDto;
import com.hoang.basis.yukihon.system.savedword.dto.SavedWordStatsDto;
import com.hoang.basis.yukihon.system.savedword.service.SavedWordService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/my-words")
@RequiredArgsConstructor
public class SavedWordController {

    private final SavedWordService savedWordService;

    @GetMapping
    public ResponseEntity<List<SavedWordDto>> getMyWords(
            @CurrentUserId Long userId, @RequestParam(required = false) String folder) {
        if (folder != null && !folder.isEmpty()) {
            return ResponseEntity.ok(savedWordService.getUserSavedWordsByFolder(userId, folder));
        }
        return ResponseEntity.ok(savedWordService.getUserSavedWords(userId));
    }

    @GetMapping("/mastered")
    public ResponseEntity<List<SavedWordDto>> getMasteredWords(
            @CurrentUserId Long userId, @RequestParam(defaultValue = "true") boolean mastered) {
        return ResponseEntity.ok(savedWordService.getMasteredWords(userId, mastered));
    }

    @GetMapping("/review")
    public ResponseEntity<List<SavedWordDto>> getReviewQueue(
            @CurrentUserId Long userId,
            @RequestParam(defaultValue = "ALL") String mode,
            @RequestParam(defaultValue = "true") boolean dueOnly) {
        return ResponseEntity.ok(savedWordService.getReviewQueue(userId, mode, dueOnly));
    }

    @PostMapping
    public ResponseEntity<SavedWordDto> saveWord(
            @CurrentUserId Long userId, @Valid @RequestBody SaveWordRequest request) {
        return ResponseEntity.ok(savedWordService.saveWord(userId, request));
    }

    @PostMapping("/{id}/toggle-mastered")
    public ResponseEntity<SavedWordDto> toggleMastered(@PathVariable Long id, @CurrentUserId Long userId) {
        return ResponseEntity.ok(savedWordService.toggleMastered(id, userId));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<SavedWordDto> reviewWord(
            @PathVariable Long id, @CurrentUserId Long userId, @Valid @RequestBody ReviewSavedWordRequest request) {
        return ResponseEntity.ok(savedWordService.reviewWord(id, userId, request));
    }

    @PutMapping("/{id}/note")
    public ResponseEntity<SavedWordDto> updateNote(
            @PathVariable Long id, @CurrentUserId Long userId, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(savedWordService.updateNote(id, userId, body.get("note")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeWord(@PathVariable Long id, @CurrentUserId Long userId) {
        savedWordService.removeSavedWord(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check/{vocabularyId}")
    public ResponseEntity<Map<String, Boolean>> isWordSaved(
            @PathVariable Long vocabularyId, @CurrentUserId Long userId) {
        return ResponseEntity.ok(Map.of("saved", savedWordService.isWordSaved(userId, vocabularyId)));
    }

    @GetMapping("/check")
    public ResponseEntity<Map<Long, Boolean>> getSavedStatuses(
            @RequestParam List<Long> vocabularyIds, @CurrentUserId Long userId) {
        return ResponseEntity.ok(savedWordService.getSavedStatuses(userId, vocabularyIds));
    }

    @GetMapping("/stats")
    public ResponseEntity<SavedWordStatsDto> getStats(@CurrentUserId Long userId) {
        return ResponseEntity.ok(savedWordService.getStats(userId));
    }
}
