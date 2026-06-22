package com.hoang.basis.yukihon.system.storymode.controller;

import com.hoang.basis.yukihon.system.storymode.dto.StoryModeStoryDto;
import com.hoang.basis.yukihon.system.storymode.service.StoryModeService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/story-mode")
@RequiredArgsConstructor
public class StoryModeController {

    private final StoryModeService storyModeService;

    @GetMapping("/stories")
    public ResponseEntity<List<StoryModeStoryDto>> getPublishedStories() {
        return ResponseEntity.ok(storyModeService.getPublishedStories());
    }
}
