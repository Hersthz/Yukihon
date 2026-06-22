package com.hoang.basis.yukihon.system.userlearningstats.service;

import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import com.hoang.basis.yukihon.system.userlearningstats.dto.UserLearningStatsDto;
import com.hoang.basis.yukihon.system.userlearningstats.entity.UserLearningStats;
import com.hoang.basis.yukihon.system.userlearningstats.repository.UserLearningStatsRepository;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class UserLearningStatsService {

    private final UserLearningStatsRepository userLearningStatsRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserLearningStatsDto getStatsByUserId(Long userId) {
        return userLearningStatsRepository
                .findByUserId(userId)
                .map(this::convertToDto)
                .orElseThrow(() -> new RuntimeException("Stats not found for user id: " + userId));
    }

    public UserLearningStatsDto initializeStatsForNewUser(Long userId) {
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        UserLearningStats stats = UserLearningStats.builder()
                .user(user)
                .userId(userId)
                .totalXP(0)
                .currentStreak(0)
                .longestStreak(0)
                .lessonsCompleted(0)
                .quizzesCompleted(0)
                .vocabularyLearned(0)
                .grammarLearned(0)
                .totalLearningMinutes(0)
                .targetJLPTLevel("N4")
                .build();

        UserLearningStats saved = userLearningStatsRepository.save(stats);
        log.info("Initialized learning stats for user: {}", userId);
        return convertToDto(saved);
    }

    public UserLearningStatsDto updateXP(Long userId, Integer xpGained) {
        UserLearningStats stats = userLearningStatsRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Stats not found for user id: " + userId));

        stats.setTotalXP(stats.getTotalXP() + xpGained);
        UserLearningStats updated = userLearningStatsRepository.save(stats);
        log.info("Updated XP for user: {} by: {}", userId, xpGained);
        return convertToDto(updated);
    }

    public UserLearningStatsDto updateStreak(Long userId) {
        UserLearningStats stats = userLearningStatsRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Stats not found for user id: " + userId));

        LocalDate today = LocalDate.now();
        LocalDate lastLearning = stats.getLastLearningDate();

        if (lastLearning == null) {
            stats.setCurrentStreak(1);
            stats.setLongestStreak(1);
        } else if (lastLearning.equals(today.minusDays(1))) {
            stats.setCurrentStreak(stats.getCurrentStreak() + 1);
            if (stats.getCurrentStreak() > stats.getLongestStreak()) {
                stats.setLongestStreak(stats.getCurrentStreak());
            }
        } else if (!lastLearning.equals(today)) {
            stats.setCurrentStreak(1);
        }

        stats.setLastLearningDate(today);
        UserLearningStats updated = userLearningStatsRepository.save(stats);
        log.info("Updated streak for user: {}, currentStreak: {}", userId, updated.getCurrentStreak());
        return convertToDto(updated);
    }

    public UserLearningStatsDto updateLessonCount(Long userId) {
        UserLearningStats stats = userLearningStatsRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Stats not found for user id: " + userId));

        stats.setLessonsCompleted(stats.getLessonsCompleted() + 1);
        UserLearningStats updated = userLearningStatsRepository.save(stats);
        return convertToDto(updated);
    }

    public UserLearningStatsDto updateQuizCount(Long userId) {
        UserLearningStats stats = userLearningStatsRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Stats not found for user id: " + userId));

        stats.setQuizzesCompleted(stats.getQuizzesCompleted() + 1);
        UserLearningStats updated = userLearningStatsRepository.save(stats);
        return convertToDto(updated);
    }

    public UserLearningStatsDto updateVocabularyCount(Long userId) {
        UserLearningStats stats = userLearningStatsRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Stats not found for user id: " + userId));

        stats.setVocabularyLearned(stats.getVocabularyLearned() + 1);
        UserLearningStats updated = userLearningStatsRepository.save(stats);
        return convertToDto(updated);
    }

    public UserLearningStatsDto updateTargetLevel(Long userId, String newLevel) {
        UserLearningStats stats = userLearningStatsRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Stats not found for user id: " + userId));

        stats.setTargetJLPTLevel(newLevel);
        UserLearningStats updated = userLearningStatsRepository.save(stats);
        log.info("Updated target JLPT level for user: {} to: {}", userId, newLevel);
        return convertToDto(updated);
    }

    public UserLearningStatsDto recordLessonActivity(
            Long userId, boolean newlyCompleted, int xpGained, int learningMinutes) {
        UserLearningStats stats = userLearningStatsRepository
                .findByUserId(userId)
                .orElseGet(() -> {
                    initializeStatsForNewUser(userId);
                    return userLearningStatsRepository
                            .findByUserId(userId)
                            .orElseThrow(() -> new RuntimeException("Stats not found for user id: " + userId));
                });

        LocalDate today = LocalDate.now();
        LocalDate lastLearning = stats.getLastLearningDate();

        if (lastLearning == null) {
            stats.setCurrentStreak(1);
            stats.setLongestStreak(Math.max(1, stats.getLongestStreak()));
        } else if (lastLearning.equals(today.minusDays(1))) {
            stats.setCurrentStreak(stats.getCurrentStreak() + 1);
            if (stats.getCurrentStreak() > stats.getLongestStreak()) {
                stats.setLongestStreak(stats.getCurrentStreak());
            }
        } else if (!lastLearning.equals(today)) {
            stats.setCurrentStreak(1);
            stats.setLongestStreak(Math.max(stats.getLongestStreak(), stats.getCurrentStreak()));
        }

        stats.setLastLearningDate(today);

        if (newlyCompleted) {
            stats.setLessonsCompleted(stats.getLessonsCompleted() + 1);
            stats.setTotalXP(stats.getTotalXP() + Math.max(0, xpGained));
            stats.setTotalLearningMinutes(stats.getTotalLearningMinutes() + Math.max(0, learningMinutes));
        }

        UserLearningStats updated = userLearningStatsRepository.save(stats);
        log.info(
                "Recorded lesson activity for user: {}, completed={}, xp={}, minutes={}",
                userId,
                newlyCompleted,
                xpGained,
                learningMinutes);
        return convertToDto(updated);
    }

    private UserLearningStatsDto convertToDto(UserLearningStats stats) {
        return UserLearningStatsDto.builder()
                .id(stats.getId())
                .userId(stats.getUserId())
                .totalXP(stats.getTotalXP())
                .currentStreak(stats.getCurrentStreak())
                .longestStreak(stats.getLongestStreak())
                .lastLearningDate(
                        stats.getLastLearningDate() != null
                                ? stats.getLastLearningDate().toString()
                                : null)
                .lessonsCompleted(stats.getLessonsCompleted())
                .quizzesCompleted(stats.getQuizzesCompleted())
                .vocabularyLearned(stats.getVocabularyLearned())
                .grammarLearned(stats.getGrammarLearned())
                .totalLearningMinutes(stats.getTotalLearningMinutes())
                .targetJLPTLevel(stats.getTargetJLPTLevel())
                .createdAt(stats.getCreatedAt().toString())
                .build();
    }
}
