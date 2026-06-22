package com.hoang.basis.yukihon.system.storymode.controller;

import com.hoang.basis.yukihon.system.storymode.dto.StoryModeStoryDto;
import com.hoang.basis.yukihon.system.storymode.dto.StoryModeStoryRequest;
import com.hoang.basis.yukihon.system.storymode.service.StoryModeService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/story-mode")
@RequiredArgsConstructor
public class AdminStoryModeController {

    private final StoryModeService storyModeService;

    @GetMapping("/stories")
    @PreAuthorize("hasAuthority('CONTENT_MANAGE')")
    public ResponseEntity<List<StoryModeStoryDto>> getStories() {
        return ResponseEntity.ok(storyModeService.getAdminStories());
    }

    @GetMapping("/stories/{id}")
    @PreAuthorize("hasAuthority('CONTENT_MANAGE')")
    public ResponseEntity<StoryModeStoryDto> getStory(@PathVariable Long id) {
        return ResponseEntity.ok(storyModeService.getAdminStory(id));
    }

    @PostMapping("/stories")
    @PreAuthorize("hasAuthority('CONTENT_MANAGE')")
    public ResponseEntity<StoryModeStoryDto> createStory(@Valid @RequestBody StoryModeStoryRequest request) {
        return ResponseEntity.ok(storyModeService.createStory(request));
    }

    @PutMapping("/stories/{id}")
    @PreAuthorize("hasAuthority('CONTENT_MANAGE')")
    public ResponseEntity<StoryModeStoryDto> updateStory(
            @PathVariable Long id, @Valid @RequestBody StoryModeStoryRequest request) {
        return ResponseEntity.ok(storyModeService.updateStory(id, request));
    }

    @DeleteMapping("/stories/{id}")
    @PreAuthorize("hasAuthority('CONTENT_MANAGE')")
    public ResponseEntity<Void> deleteStory(@PathVariable Long id) {
        storyModeService.deleteStory(id);
        return ResponseEntity.noContent().build();
    }
}
