package com.hoang.basis.yukihon.system.quizattempt.controller;

import com.hoang.basis.yukihon.base.security.CurrentUserId;
import com.hoang.basis.yukihon.system.quizattempt.dto.QuizAttemptDto;
import com.hoang.basis.yukihon.system.quizattempt.dto.QuizAttemptRequest;
import com.hoang.basis.yukihon.system.quizattempt.service.QuizAttemptService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quiz-attempts")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.frontend-url:http://localhost:5173}")
public class QuizAttemptController {

    private final QuizAttemptService quizAttemptService;

    @PostMapping
    public ResponseEntity<QuizAttemptDto> recordAttempt(
            @CurrentUserId Long userId, @Valid @RequestBody QuizAttemptRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(quizAttemptService.recordAttempt(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<QuizAttemptDto>> getRecentAttempts(
            @CurrentUserId Long userId,
            @RequestParam(defaultValue = "20") Integer limit,
            @RequestParam(required = false) Boolean correct) {
        return ResponseEntity.ok(quizAttemptService.getRecentAttempts(userId, limit, correct));
    }
}
