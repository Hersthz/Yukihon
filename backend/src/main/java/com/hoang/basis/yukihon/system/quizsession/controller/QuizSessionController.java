package com.hoang.basis.yukihon.system.quizsession.controller;

import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.quizsession.dto.QuizSessionDto;
import com.hoang.basis.yukihon.system.quizsession.dto.QuizSessionRequest;
import com.hoang.basis.yukihon.system.quizsession.service.QuizSessionService;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<QuizSessionDto> recordSession(
            @AuthenticationPrincipal UserDetails userDetails, @Valid @RequestBody QuizSessionRequest request) {
        Long userId = resolveCurrentUserId(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(quizSessionService.recordSession(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<QuizSessionDto>> getRecentSessions(
            @AuthenticationPrincipal UserDetails userDetails, @RequestParam(defaultValue = "10") Integer limit) {
        Long userId = resolveCurrentUserId(userDetails);
        return ResponseEntity.ok(quizSessionService.getRecentSessions(userId, limit));
    }

    private Long resolveCurrentUserId(UserDetails userDetails) {
        if (userDetails == null || userDetails.getUsername() == null) {
            throw new AccessDeniedException("Authentication required");
        }

        return userRepository
                .findByEmail(userDetails.getUsername().toLowerCase())
                .map(user -> user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
