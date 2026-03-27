package com.hoang.basis.yukihon.system.quiz.controller;

import com.hoang.basis.yukihon.system.quiz.dto.QuizDto;
import com.hoang.basis.yukihon.system.quiz.dto.QuizRequest;
import com.hoang.basis.yukihon.system.quiz.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.frontend-url:http://localhost:5173}")
public class QuizController {

    private final QuizService quizService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('CONTENT_READ','CONTENT_MANAGE')")
    public ResponseEntity<List<QuizDto>> getAllQuizzes() {
        List<QuizDto> quizzes = quizService.getAll();
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CONTENT_READ','CONTENT_MANAGE')")
    public ResponseEntity<QuizDto> getQuizById(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }

    @GetMapping("/type/{quizType}")
    @PreAuthorize("hasAnyAuthority('CONTENT_READ','CONTENT_MANAGE')")
    public ResponseEntity<List<QuizDto>> getByType(@PathVariable String quizType) {
        List<QuizDto> quizzes = quizService.getByType(quizType);
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/difficulty/{difficultyLevel}")
    @PreAuthorize("hasAnyAuthority('CONTENT_READ','CONTENT_MANAGE')")
    public ResponseEntity<List<QuizDto>> getByDifficultyLevel(@PathVariable String difficultyLevel) {
        List<QuizDto> quizzes = quizService.getByDifficultyLevel(difficultyLevel);
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/level/{jlptLevel}")
    @PreAuthorize("hasAnyAuthority('CONTENT_READ','CONTENT_MANAGE')")
    public ResponseEntity<List<QuizDto>> getByJlptLevel(@PathVariable String jlptLevel) {
        List<QuizDto> quizzes = quizService.getByJlptLevel(jlptLevel);
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/lesson/{lessonId}")
    @PreAuthorize("hasAnyAuthority('CONTENT_READ','CONTENT_MANAGE')")
    public ResponseEntity<List<QuizDto>> getByLessonId(@PathVariable Long lessonId) {
        return ResponseEntity.ok(quizService.getByLessonId(lessonId));
    }

    @GetMapping("/level/{level}/difficulty/{difficulty}")
    @PreAuthorize("hasAnyAuthority('CONTENT_READ','CONTENT_MANAGE')")
    public ResponseEntity<List<QuizDto>> getByLevelAndDifficulty(
            @PathVariable String level,
            @PathVariable String difficulty
    ) {
        List<QuizDto> quizzes = quizService.getByLevelAndDifficulty(level, difficulty);
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/difficulties")
    @PreAuthorize("hasAnyAuthority('CONTENT_READ','CONTENT_MANAGE')")
    public ResponseEntity<List<String>> getAllDifficultyLevels() {
        List<String> difficulties = quizService.getAllDifficultyLevels();
        return ResponseEntity.ok(difficulties);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CONTENT_MANAGE')")
    public ResponseEntity<QuizDto> createQuiz(@Valid @RequestBody QuizRequest request) {
        QuizDto quiz = quizService.createQuiz(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(quiz);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CONTENT_MANAGE')")
    public ResponseEntity<QuizDto> updateQuiz(
            @PathVariable Long id,
            @Valid @RequestBody QuizRequest request
    ) {
        QuizDto updated = quizService.updateQuiz(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CONTENT_MANAGE')")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.noContent().build();
    }
}
