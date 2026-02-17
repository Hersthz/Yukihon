package com.hoang.basis.yukihon.controller;

import com.hoang.basis.yukihon.dto.lesson.LessonDto;
import com.hoang.basis.yukihon.dto.lesson.LessonRequest;
import com.hoang.basis.yukihon.service.LessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.frontend-url:http://localhost:5173}")
public class LessonController {

    private final LessonService lessonService;

    @GetMapping
    public ResponseEntity<List<LessonDto>> getAllLessons() {
        List<LessonDto> lessons = lessonService.getAll();
        return ResponseEntity.ok(lessons);
    }

    @GetMapping("/published")
    public ResponseEntity<List<LessonDto>> getPublishedLessons() {
        List<LessonDto> lessons = lessonService.getPublishedLessons();
        return ResponseEntity.ok(lessons);
    }

    @GetMapping("/published/level/{jlptLevel}")
    public ResponseEntity<List<LessonDto>> getPublishedLessonsByLevel(@PathVariable String jlptLevel) {
        List<LessonDto> lessons = lessonService.getPublishedLessonsByLevel(jlptLevel);
        return ResponseEntity.ok(lessons);
    }

    @GetMapping("/published/category/{category}")
    public ResponseEntity<List<LessonDto>> getPublishedLessonsByCategory(@PathVariable String category) {
        List<LessonDto> lessons = lessonService.getPublishedLessonsByCategory(category);
        return ResponseEntity.ok(lessons);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LessonDto> getLessonById(@PathVariable Long id) {
        return ResponseEntity.ok(lessonService.getLessonById(id));
    }

    @GetMapping("/level/{jlptLevel}")
    public ResponseEntity<List<LessonDto>> getByJlptLevel(@PathVariable String jlptLevel) {
        List<LessonDto> lessons = lessonService.getByJlptLevel(jlptLevel);
        return ResponseEntity.ok(lessons);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<LessonDto>> getByCategory(@PathVariable String category) {
        List<LessonDto> lessons = lessonService.getByCategory(category);
        return ResponseEntity.ok(lessons);
    }

    @PostMapping
    public ResponseEntity<LessonDto> createLesson(@Valid @RequestBody LessonRequest request) {
        LessonDto lesson = lessonService.createLesson(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(lesson);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LessonDto> updateLesson(
            @PathVariable Long id,
            @Valid @RequestBody LessonRequest request
    ) {
        LessonDto updated = lessonService.updateLesson(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long id) {
        lessonService.deleteLesson(id);
        return ResponseEntity.noContent().build();
    }
}
