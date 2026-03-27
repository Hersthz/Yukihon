package com.hoang.basis.yukihon.system.lesson.service;

import com.hoang.basis.yukihon.system.lesson.dto.LessonDto;
import com.hoang.basis.yukihon.system.lesson.dto.LessonRequest;
import com.hoang.basis.yukihon.system.lesson.dto.LessonVersionDto;
import com.hoang.basis.yukihon.system.lesson.entity.Lesson;
import com.hoang.basis.yukihon.system.lesson.entity.LessonVersion;
import com.hoang.basis.yukihon.system.lesson.repository.LessonRepository;
import com.hoang.basis.yukihon.system.lesson.repository.LessonVersionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Stream;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class LessonService {

    private final LessonRepository lessonRepository;
    private final LessonVersionRepository lessonVersionRepository;

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

    @Transactional(readOnly = true)
    public List<LessonVersionDto> getLessonVersions(Long lessonId) {
        if (!lessonRepository.existsById(lessonId)) {
            throw new RuntimeException("Lesson not found with id: " + lessonId);
        }

        return lessonVersionRepository.findByLessonIdOrderByVersionNumberDesc(lessonId).stream()
                .map(this::convertVersionToDto)
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
                .relatedVocabularyIds(joinIds(request.getRelatedVocabularyIds()))
                .relatedGrammarIds(joinIds(request.getRelatedGrammarIds()))
                .relatedQuizIds(joinIds(request.getRelatedQuizIds()))
                .build();

        Lesson saved = lessonRepository.save(lesson);
        createVersionSnapshot(saved, "CREATED");
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
        lesson.setOrderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0);
        lesson.setAudioUrl(request.getAudioUrl());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setImageUrl(request.getImageUrl());
        lesson.setRelatedVocabularyIds(joinIds(request.getRelatedVocabularyIds()));
        lesson.setRelatedGrammarIds(joinIds(request.getRelatedGrammarIds()));
        lesson.setRelatedQuizIds(joinIds(request.getRelatedQuizIds()));

        Lesson updated = lessonRepository.save(lesson);
        createVersionSnapshot(updated, "UPDATED");
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
                .relatedVocabularyIds(parseIds(lesson.getRelatedVocabularyIds()))
                .relatedGrammarIds(parseIds(lesson.getRelatedGrammarIds()))
                .relatedQuizIds(parseIds(lesson.getRelatedQuizIds()))
                .createdAt(lesson.getCreatedAt().toString())
                .build();
    }

    private LessonVersionDto convertVersionToDto(LessonVersion version) {
        return LessonVersionDto.builder()
                .id(version.getId())
                .lessonId(version.getLessonId())
                .versionNumber(version.getVersionNumber())
                .changeAction(version.getChangeAction())
                .title(version.getTitle())
                .description(version.getDescription())
                .content(version.getContent())
                .jlptLevel(version.getJlptLevel())
                .category(version.getCategory())
                .status(version.getStatus())
                .orderIndex(version.getOrderIndex())
                .audioUrl(version.getAudioUrl())
                .videoUrl(version.getVideoUrl())
                .imageUrl(version.getImageUrl())
                .relatedVocabularyIds(parseIds(version.getRelatedVocabularyIds()))
                .relatedGrammarIds(parseIds(version.getRelatedGrammarIds()))
                .relatedQuizIds(parseIds(version.getRelatedQuizIds()))
                .createdAt(version.getCreatedAt().toString())
                .build();
    }

    private void createVersionSnapshot(Lesson lesson, String action) {
        int nextVersion = lessonVersionRepository.findMaxVersionNumberByLessonId(lesson.getId()) + 1;

        LessonVersion snapshot = LessonVersion.builder()
                .lessonId(lesson.getId())
                .versionNumber(nextVersion)
                .changeAction(action)
                .title(lesson.getTitle())
                .description(lesson.getDescription())
                .content(lesson.getContent())
                .jlptLevel(lesson.getJlptLevel())
                .category(lesson.getCategory())
                .status(lesson.getStatus().name())
                .orderIndex(lesson.getOrderIndex())
                .audioUrl(lesson.getAudioUrl())
                .videoUrl(lesson.getVideoUrl())
                .imageUrl(lesson.getImageUrl())
                .relatedVocabularyIds(lesson.getRelatedVocabularyIds())
                .relatedGrammarIds(lesson.getRelatedGrammarIds())
                .relatedQuizIds(lesson.getRelatedQuizIds())
                .build();

        lessonVersionRepository.save(snapshot);
    }

    private String joinIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return null;
        }

        return ids.stream()
                .filter(java.util.Objects::nonNull)
                .distinct()
                .map(String::valueOf)
                .collect(Collectors.joining(","));
    }

    private List<Long> parseIds(String raw) {
        if (raw == null || raw.isBlank()) {
            return Collections.emptyList();
        }

        return Stream.of(raw.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .map(Long::valueOf)
                .collect(Collectors.toList());
    }
}
