package com.hoang.basis.yukihon.system.lesson.service;

import com.hoang.basis.yukihon.system.lesson.dto.LessonDto;
import com.hoang.basis.yukihon.system.lesson.dto.LessonRequest;
import com.hoang.basis.yukihon.system.lesson.entity.Lesson;
import com.hoang.basis.yukihon.system.lesson.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class LessonService {

    private final LessonRepository lessonRepository;

    @Transactional(readOnly = true)
    public LessonDto getLessonById(Long id) {
        return lessonRepository.findById(id)
                .map(this::convertToDto)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<LessonDto> getAll() {
        return lessonRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LessonDto> getPublishedLessons() {
        return lessonRepository.findPublishedLessons()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LessonDto> getPublishedLessonsByLevel(String jlptLevel) {
        return lessonRepository.findPublishedLessonsByLevel(jlptLevel)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LessonDto> getPublishedLessonsByCategory(String category) {
        return lessonRepository.findPublishedLessonsByCategory(category)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LessonDto> getByJlptLevel(String jlptLevel) {
        return lessonRepository.findByJlptLevel(jlptLevel)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LessonDto> getByCategory(String category) {
        return lessonRepository.findByCategory(category)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public LessonDto createLesson(LessonRequest request) {
        Lesson lesson = Lesson.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .content(request.getContent())
                .jlptLevel(request.getJlptLevel())
                .category(request.getCategory())
                .status(Lesson.LessonStatus.valueOf(request.getStatus() != null ? request.getStatus() : "DRAFT"))
                .orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0)
                .audioUrl(request.getAudioUrl())
                .videoUrl(request.getVideoUrl())
                .imageUrl(request.getImageUrl())
                .build();

        Lesson saved = lessonRepository.save(lesson);
        log.info("Created lesson: {} with title: {}", saved.getId(), saved.getTitle());
        return convertToDto(saved);
    }

    public LessonDto updateLesson(Long id, LessonRequest request) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + id));

        lesson.setTitle(request.getTitle());
        lesson.setDescription(request.getDescription());
        lesson.setContent(request.getContent());
        lesson.setJlptLevel(request.getJlptLevel());
        lesson.setCategory(request.getCategory());
        if (request.getStatus() != null) {
            lesson.setStatus(Lesson.LessonStatus.valueOf(request.getStatus()));
        }
        lesson.setOrderIndex(request.getOrderIndex());
        lesson.setAudioUrl(request.getAudioUrl());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setImageUrl(request.getImageUrl());

        Lesson updated = lessonRepository.save(lesson);
        log.info("Updated lesson: {}", updated.getId());
        return convertToDto(updated);
    }

    public void deleteLesson(Long id) {
        if (!lessonRepository.existsById(id)) {
            throw new RuntimeException("Lesson not found with id: " + id);
        }
        lessonRepository.deleteById(id);
        log.info("Deleted lesson with id: {}", id);
    }

    private LessonDto convertToDto(Lesson lesson) {
        return LessonDto.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .description(lesson.getDescription())
                .content(lesson.getContent())
                .jlptLevel(lesson.getJlptLevel())
                .category(lesson.getCategory())
                .status(lesson.getStatus().toString())
                .orderIndex(lesson.getOrderIndex())
                .audioUrl(lesson.getAudioUrl())
                .videoUrl(lesson.getVideoUrl())
                .imageUrl(lesson.getImageUrl())
                .createdAt(lesson.getCreatedAt().toString())
                .build();
    }
}
