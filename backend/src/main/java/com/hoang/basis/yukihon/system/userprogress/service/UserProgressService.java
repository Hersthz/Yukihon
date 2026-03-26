package com.hoang.basis.yukihon.system.userprogress.service;

import com.hoang.basis.yukihon.system.userprogress.dto.UserProgressDto;
import com.hoang.basis.yukihon.system.userprogress.dto.UserProgressRequest;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.userprogress.entity.UserProgress;
import com.hoang.basis.yukihon.system.userprogress.repository.UserProgressRepository;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
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

        UserProgress existing = findExistingProgress(userId, request).orElse(null);
        if (existing != null) {
            return updateEntity(existing, request);
        }

        UserProgress progress = UserProgress.builder()
                .user(user)
                .userId(userId)
                .lessonId(request.getLessonId())
                .quizId(request.getQuizId())
                .vocabularyId(request.getVocabularyId())
                .status(UserProgress.ProgressStatus.valueOf(request.getStatus() != null ? request.getStatus() : "NOT_STARTED"))
                .progressType(resolveProgressType(request))
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
        return updateEntity(progress, request);
    }

    public UserProgressDto getProgressByIdForUser(Long id, Long actorUserId, boolean isAdmin) {
        UserProgress progress = findProgressForActor(id, actorUserId, isAdmin);
        return convertToDto(progress);
    }

    public UserProgressDto updateProgressForUser(Long id, UserProgressRequest request, Long actorUserId, boolean isAdmin) {
        UserProgress progress = findProgressForActor(id, actorUserId, isAdmin);
        return updateEntity(progress, request);
    }

    public void deleteProgressForUser(Long id, Long actorUserId, boolean isAdmin) {
        UserProgress progress = findProgressForActor(id, actorUserId, isAdmin);
        userProgressRepository.delete(progress);
        log.info("Deleted progress with id: {} by actorUserId={}", id, actorUserId);
    }

    public void deleteProgress(Long id) {
        if (!userProgressRepository.existsById(id)) {
            throw new RuntimeException("Progress not found with id: " + id);
        }
        userProgressRepository.deleteById(id);
        log.info("Deleted progress with id: {}", id);
    }

    private UserProgress findProgressForActor(Long id, Long actorUserId, boolean isAdmin) {
        if (isAdmin) {
            return userProgressRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Progress not found with id: " + id));
        }

        return userProgressRepository.findByIdAndUserId(id, actorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Progress not found with id: " + id));
    }

    private java.util.Optional<UserProgress> findExistingProgress(Long userId, UserProgressRequest request) {
        if (request.getLessonId() != null) {
            return userProgressRepository.findByUserIdAndLessonId(userId, request.getLessonId());
        }
        if (request.getQuizId() != null) {
            return userProgressRepository.findByUserIdAndQuizId(userId, request.getQuizId());
        }
        if (request.getVocabularyId() != null) {
            return userProgressRepository.findByUserIdAndVocabularyId(userId, request.getVocabularyId());
        }
        return java.util.Optional.empty();
    }

    private String resolveProgressType(UserProgressRequest request) {
        if (request.getLessonId() != null) {
            return "lesson";
        }
        if (request.getQuizId() != null) {
            return "quiz";
        }
        if (request.getVocabularyId() != null) {
            return "vocabulary";
        }
        return "general";
    }

    private UserProgressDto updateEntity(UserProgress progress, UserProgressRequest request) {
        progress.setLessonId(request.getLessonId() != null ? request.getLessonId() : progress.getLessonId());
        progress.setQuizId(request.getQuizId() != null ? request.getQuizId() : progress.getQuizId());
        progress.setVocabularyId(request.getVocabularyId() != null ? request.getVocabularyId() : progress.getVocabularyId());
        String resolvedType = resolveProgressType(request);
        progress.setProgressType("general".equals(resolvedType) ? progress.getProgressType() : resolvedType);
        progress.setScore(request.getScore());
        progress.setTotalScore(request.getTotalScore());
        if (request.getStatus() != null) {
            progress.setStatus(UserProgress.ProgressStatus.valueOf(request.getStatus()));
            if ("COMPLETED".equals(request.getStatus())) {
                progress.setCompletedAt(Instant.now());
            } else {
                progress.setCompletedAt(null);
            }
        }
        progress.setNotes(request.getNotes());
        progress.setAttemptCount((progress.getAttemptCount() != null ? progress.getAttemptCount() : 0) + 1);

        UserProgress updated = userProgressRepository.save(progress);
        log.info("Updated progress: {}", updated.getId());
        return convertToDto(updated);
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
