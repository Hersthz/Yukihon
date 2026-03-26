package com.hoang.basis.yukihon.system.savedword.controller;

import com.hoang.basis.yukihon.system.savedword.dto.ReviewSavedWordRequest;
import com.hoang.basis.yukihon.system.savedword.dto.SaveWordRequest;
import com.hoang.basis.yukihon.system.savedword.dto.SavedWordDto;
import com.hoang.basis.yukihon.system.savedword.dto.SavedWordStatsDto;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import com.hoang.basis.yukihon.system.savedword.service.SavedWordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/my-words")
@RequiredArgsConstructor
public class SavedWordController {

    private final SavedWordService savedWordService;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<List<SavedWordDto>> getMyWords(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String folder
    ) {
        Long userId = getUserId(userDetails);
        if (folder != null && !folder.isEmpty()) {
            return ResponseEntity.ok(savedWordService.getUserSavedWordsByFolder(userId, folder));
        }
        return ResponseEntity.ok(savedWordService.getUserSavedWords(userId));
    }

    @GetMapping("/mastered")
    public ResponseEntity<List<SavedWordDto>> getMasteredWords(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "true") boolean mastered
    ) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(savedWordService.getMasteredWords(userId, mastered));
    }

    @GetMapping("/review")
    public ResponseEntity<List<SavedWordDto>> getReviewQueue(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "ALL") String mode,
            @RequestParam(defaultValue = "true") boolean dueOnly
    ) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(savedWordService.getReviewQueue(userId, mode, dueOnly));
    }

    @PostMapping
    public ResponseEntity<SavedWordDto> saveWord(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SaveWordRequest request
    ) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(savedWordService.saveWord(userId, request));
    }

    @PostMapping("/{id}/toggle-mastered")
    public ResponseEntity<SavedWordDto> toggleMastered(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(savedWordService.toggleMastered(id, userId));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<SavedWordDto> reviewWord(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ReviewSavedWordRequest request
    ) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(savedWordService.reviewWord(id, userId, request));
    }

    @PutMapping("/{id}/note")
    public ResponseEntity<SavedWordDto> updateNote(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body
    ) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(savedWordService.updateNote(id, userId, body.get("note")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeWord(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = getUserId(userDetails);
        savedWordService.removeSavedWord(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check/{vocabularyId}")
    public ResponseEntity<Map<String, Boolean>> isWordSaved(
            @PathVariable Long vocabularyId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(Map.of("saved", savedWordService.isWordSaved(userId, vocabularyId)));
    }

    @GetMapping("/stats")
    public ResponseEntity<SavedWordStatsDto> getStats(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(savedWordService.getStats(userId));
    }
}
