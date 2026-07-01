package com.hoang.basis.yukihon.system.learningpath.controller;

import com.hoang.basis.yukihon.base.security.CurrentUserId;
import com.hoang.basis.yukihon.system.learningpath.dto.LearningPathDto;
import com.hoang.basis.yukihon.system.learningpath.service.LearningPathService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/learning-path")
@RequiredArgsConstructor
public class LearningPathController {

    private final LearningPathService learningPathService;

    @GetMapping
    public ResponseEntity<LearningPathDto> getLearningPath(@CurrentUserId Long userId) {
        return ResponseEntity.ok(learningPathService.getLearningPath(userId));
    }
}
