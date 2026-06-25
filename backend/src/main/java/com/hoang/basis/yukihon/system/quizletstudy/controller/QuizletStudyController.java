package com.hoang.basis.yukihon.system.quizletstudy.controller;

import com.hoang.basis.yukihon.base.security.CurrentUserId;
import com.hoang.basis.yukihon.system.quizletstudy.dto.QuizletAnswerRequest;
import com.hoang.basis.yukihon.system.quizletstudy.dto.QuizletCardProgressDto;
import com.hoang.basis.yukihon.system.quizletstudy.service.QuizletStudyService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Quizlet-style study (Flashcard/Learn/Match) — non-SRS, never touches the SRS schedule. */
@RestController
@RequestMapping("/api/quizlet/study")
@RequiredArgsConstructor
public class QuizletStudyController {

    private final QuizletStudyService quizletStudyService;

    @GetMapping("/{deckId}/progress")
    public ResponseEntity<List<QuizletCardProgressDto>> getProgress(
            @PathVariable Long deckId, @CurrentUserId Long userId) {
        return ResponseEntity.ok(quizletStudyService.getProgress(userId, deckId));
    }

    @PostMapping("/answer")
    public ResponseEntity<QuizletCardProgressDto> answer(
            @Valid @RequestBody QuizletAnswerRequest request, @CurrentUserId Long userId) {
        return ResponseEntity.ok(quizletStudyService.answer(userId, request));
    }
}
