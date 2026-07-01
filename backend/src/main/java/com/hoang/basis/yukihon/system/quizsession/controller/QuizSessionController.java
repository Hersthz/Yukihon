package com.hoang.basis.yukihon.system.quizsession.controller;

import com.hoang.basis.yukihon.base.security.CurrentUserId;
import com.hoang.basis.yukihon.system.quizsession.dto.QuizSessionDto;
import com.hoang.basis.yukihon.system.quizsession.dto.QuizSessionRequest;
import com.hoang.basis.yukihon.system.quizsession.service.QuizSessionService;
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
@RequestMapping("/api/quiz-sessions")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.frontend-url:http://localhost:5173}")
public class QuizSessionController {

    private final QuizSessionService quizSessionService;

    @PostMapping
    public ResponseEntity<QuizSessionDto> recordSession(
            @CurrentUserId Long userId, @Valid @RequestBody QuizSessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(quizSessionService.recordSession(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<QuizSessionDto>> getRecentSessions(
            @CurrentUserId Long userId, @RequestParam(defaultValue = "10") Integer limit) {
        return ResponseEntity.ok(quizSessionService.getRecentSessions(userId, limit));
    }
}
