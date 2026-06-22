package com.hoang.basis.yukihon.system.quizattempt.controller;

import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.quizattempt.dto.QuizAttemptDto;
import com.hoang.basis.yukihon.system.quizattempt.dto.QuizAttemptRequest;
import com.hoang.basis.yukihon.system.quizattempt.service.QuizAttemptService;
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
@RequestMapping("/api/quiz-attempts")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.frontend-url:http://localhost:5173}")
public class QuizAttemptController {

    private final QuizAttemptService quizAttemptService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<QuizAttemptDto> recordAttempt(
            @AuthenticationPrincipal UserDetails userDetails, @Valid @RequestBody QuizAttemptRequest request) {
        Long userId = resolveCurrentUserId(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(quizAttemptService.recordAttempt(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<QuizAttemptDto>> getRecentAttempts(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "20") Integer limit,
            @RequestParam(required = false) Boolean correct) {
        Long userId = resolveCurrentUserId(userDetails);
        return ResponseEntity.ok(quizAttemptService.getRecentAttempts(userId, limit, correct));
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
