package com.hoang.basis.yukihon.service;

import com.hoang.basis.yukihon.dto.progress.UserProgressDto;
import com.hoang.basis.yukihon.dto.progress.UserProgressRequest;
import com.hoang.basis.yukihon.model.User;
import com.hoang.basis.yukihon.model.UserProgress;
import com.hoang.basis.yukihon.repository.UserProgressRepository;
import com.hoang.basis.yukihon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class UserProgressService {

    private final UserProgressRepository userProgressRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserProgressDto getProgressById(Long id) {
        return userProgressRepository.findById(id)
                .map(this::convertToDto)
                .orElseThrow(() -> new RuntimeException("Progress not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<UserProgressDto> getUserProgress(Long userId) {
        return userProgressRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserProgressDto> getUserProgressByStatus(Long userId, String status) {
        UserProgress.ProgressStatus progressStatus = UserProgress.ProgressStatus.valueOf(status);
        return userProgressRepository.findByUserIdAndStatus(userId, progressStatus)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserProgressDto getLessonProgress(Long userId, Long lessonId) {
        return userProgressRepository.findByUserIdAndLessonId(userId, lessonId)
                .map(this::convertToDto)
                .orElseThrow(() -> new RuntimeException("Progress not found for user and lesson"));
    }

    @Transactional(readOnly = true)
    public UserProgressDto getQuizProgress(Long userId, Long quizId) {
        return userProgressRepository.findByUserIdAndQuizId(userId, quizId)
                .map(this::convertToDto)
                .orElseThrow(() -> new RuntimeException("Progress not found for user and quiz"));
    }

    public UserProgressDto createProgress(Long userId, UserProgressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        UserProgress progress = UserProgress.builder()
                .user(user)
                .userId(userId)
                .lessonId(request.getLessonId())
                .quizId(request.getQuizId())
                .vocabularyId(request.getVocabularyId())
                .status(UserProgress.ProgressStatus.valueOf(request.getStatus() != null ? request.getStatus() : "NOT_STARTED"))
                .score(request.getScore())
                .totalScore(request.getTotalScore())
                .notes(request.getNotes())
                .build();

        UserProgress saved = userProgressRepository.save(progress);
        log.info("Created progress for user: {} with type: {}", userId, request.getStatus());
        return convertToDto(saved);
    }

    public UserProgressDto updateProgress(Long id, UserProgressRequest request) {
        UserProgress progress = userProgressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Progress not found with id: " + id));

        progress.setScore(request.getScore());
        progress.setTotalScore(request.getTotalScore());
        if (request.getStatus() != null) {
            progress.setStatus(UserProgress.ProgressStatus.valueOf(request.getStatus()));
            if (request.getStatus().equals("COMPLETED")) {
                progress.setCompletedAt(Instant.now());
            }
        }
        progress.setNotes(request.getNotes());
        progress.setAttemptCount(progress.getAttemptCount() + 1);

        UserProgress updated = userProgressRepository.save(progress);
        log.info("Updated progress: {}", updated.getId());
        return convertToDto(updated);
    }

    public void deleteProgress(Long id) {
        if (!userProgressRepository.existsById(id)) {
            throw new RuntimeException("Progress not found with id: " + id);
        }
        userProgressRepository.deleteById(id);
        log.info("Deleted progress with id: {}", id);
    }

    private UserProgressDto convertToDto(UserProgress progress) {
        return UserProgressDto.builder()
                .id(progress.getId())
                .userId(progress.getUserId())
                .lessonId(progress.getLessonId())
                .quizId(progress.getQuizId())
                .vocabularyId(progress.getVocabularyId())
                .status(progress.getStatus().toString())
                .progressType(progress.getProgressType())
                .score(progress.getScore())
                .totalScore(progress.getTotalScore())
                .attemptCount(progress.getAttemptCount())
                .notes(progress.getNotes())
                .createdAt(progress.getCreatedAt().toString())
                .completedAt(progress.getCompletedAt() != null ? progress.getCompletedAt().toString() : null)
                .build();
    }
}
