package com.hoang.basis.yukihon.system.savedword.service;

import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.savedword.dto.ReviewSavedWordRequest;
import com.hoang.basis.yukihon.system.savedword.dto.SaveWordRequest;
import com.hoang.basis.yukihon.system.savedword.dto.SavedWordDto;
import com.hoang.basis.yukihon.system.savedword.dto.SavedWordStatsDto;
import com.hoang.basis.yukihon.system.savedword.entity.SavedWord;
import com.hoang.basis.yukihon.system.savedword.repository.SavedWordRepository;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import com.hoang.basis.yukihon.system.vocabulary.entity.Vocabulary;
import com.hoang.basis.yukihon.system.vocabulary.repository.VocabularyRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SavedWordService {

    private static final Pattern HAN_PATTERN = Pattern.compile("\\p{IsHan}");

    private final SavedWordRepository savedWordRepository;
    private final UserRepository userRepository;
    private final VocabularyRepository vocabularyRepository;

    public List<SavedWordDto> getUserSavedWords(Long userId) {
        return savedWordRepository.findByUserIdOrderByNextReviewAtAscCreatedAtDesc(userId).stream()
                .map(SavedWordDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<SavedWordDto> getUserSavedWordsByFolder(Long userId, String folder) {
        return savedWordRepository.findByUserIdAndFolderNameOrderByCreatedAtDesc(userId, folder).stream()
                .map(SavedWordDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<SavedWordDto> getMasteredWords(Long userId, boolean mastered) {
        return savedWordRepository.findByUserIdAndMasteredOrderByCreatedAtDesc(userId, mastered).stream()
                .map(SavedWordDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<SavedWordDto> getReviewQueue(Long userId, String mode, boolean dueOnly) {
        List<SavedWord> savedWords = dueOnly
                ? savedWordRepository.findByUserIdAndNextReviewAtLessThanEqualOrderByNextReviewAtAscCreatedAtDesc(
                        userId, java.time.Instant.now())
                : savedWordRepository.findByUserIdOrderByNextReviewAtAscCreatedAtDesc(userId);

        return savedWords.stream()
                .filter(savedWord -> matchesMode(savedWord, mode))
                .map(SavedWordDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public SavedWordDto saveWord(Long userId, SaveWordRequest request) {
        SavedWord existing = savedWordRepository
                .findByUserIdAndVocabularyId(userId, request.getVocabularyId())
                .orElse(null);
        if (existing != null) {
            return SavedWordDto.fromEntity(existing);
        }

        User user = findUserByIdOrThrow(userId);
        Vocabulary vocab = findVocabularyByIdOrThrow(request.getVocabularyId());

        SavedWord savedWord = SavedWord.builder()
                .user(user)
                .vocabulary(vocab)
                .folderName(request.getFolderName() != null ? request.getFolderName() : "Default")
                .personalNote(request.getPersonalNote())
                .reviewIntervalDays(0)
                .easeFactor(2.5)
                .repetitionCount(0)
                .reviewCount(0)
                .nextReviewAt(java.time.Instant.now())
                .build();

        SavedWord saved = savedWordRepository.save(savedWord);
        log.info("User {} saved word {}", userId, vocab.getKanji());
        return SavedWordDto.fromEntity(saved);
    }

    @Transactional
    public SavedWordDto toggleMastered(Long savedWordId, Long userId) {
        SavedWord saved = findOwnedSavedWordOrThrow(savedWordId, userId);

        saved.setMastered(!saved.isMastered());
        SavedWord updated = savedWordRepository.save(saved);
        return SavedWordDto.fromEntity(updated);
    }

    @Transactional
    public SavedWordDto reviewWord(Long savedWordId, Long userId, ReviewSavedWordRequest request) {
        SavedWord saved = findOwnedSavedWordOrThrow(savedWordId, userId);
        ReviewRating rating = ReviewRating.from(request.getRating());
        java.time.Instant now = java.time.Instant.now();

        double easeFactor = saved.getEaseFactor() != null ? saved.getEaseFactor() : 2.5;
        int intervalDays = saved.getReviewIntervalDays() != null ? saved.getReviewIntervalDays() : 0;
        int repetitionCount = saved.getRepetitionCount() != null ? saved.getRepetitionCount() : 0;

        switch (rating) {
            case AGAIN -> {
                repetitionCount = 0;
                intervalDays = 1;
                easeFactor = Math.max(1.3, easeFactor - 0.2);
            }
            case HARD -> {
                repetitionCount = Math.max(1, repetitionCount);
                intervalDays = Math.max(1, intervalDays <= 1 ? 2 : (int) Math.round(intervalDays * 1.2));
                easeFactor = Math.max(1.3, easeFactor - 0.15);
            }
            case GOOD -> {
                repetitionCount += 1;
                if (repetitionCount <= 1) {
                    intervalDays = 1;
                } else if (repetitionCount == 2) {
                    intervalDays = 3;
                } else {
                    intervalDays = Math.max(4, (int) Math.round(intervalDays * easeFactor));
                }
            }
            case EASY -> {
                repetitionCount += 1;
                if (repetitionCount <= 1) {
                    intervalDays = 2;
                } else if (repetitionCount == 2) {
                    intervalDays = 5;
                } else {
                    intervalDays = Math.max(6, (int) Math.round(intervalDays * (easeFactor + 0.25)));
                }
                easeFactor += 0.15;
            }
        }

        saved.setEaseFactor(easeFactor);
        saved.setReviewIntervalDays(intervalDays);
        saved.setRepetitionCount(repetitionCount);
        saved.setReviewCount((saved.getReviewCount() != null ? saved.getReviewCount() : 0) + 1);
        saved.setLastReviewedAt(now);
        saved.setNextReviewAt(now.plusSeconds(intervalDays * 24L * 60L * 60L));
        SavedWord updated = savedWordRepository.save(saved);
        return SavedWordDto.fromEntity(updated);
    }

    @Transactional
    public SavedWordDto updateNote(Long savedWordId, Long userId, String note) {
        SavedWord saved = findOwnedSavedWordOrThrow(savedWordId, userId);

        saved.setPersonalNote(note);
        SavedWord updated = savedWordRepository.save(saved);
        return SavedWordDto.fromEntity(updated);
    }

    @Transactional
    public void removeSavedWord(Long savedWordId, Long userId) {
        SavedWord saved = findOwnedSavedWordOrThrow(savedWordId, userId);

        savedWordRepository.delete(saved);
        log.info("User {} removed saved word {}", userId, savedWordId);
    }

    public boolean isWordSaved(Long userId, Long vocabularyId) {
        return savedWordRepository.existsByUserIdAndVocabularyId(userId, vocabularyId);
    }

    public Map<Long, Boolean> getSavedStatuses(Long userId, List<Long> vocabularyIds) {
        if (vocabularyIds == null || vocabularyIds.isEmpty()) {
            return Map.of();
        }

        List<Long> normalizedIds = vocabularyIds.stream()
                .filter(id -> id != null && id > 0)
                .distinct()
                .collect(Collectors.toList());
        if (normalizedIds.isEmpty()) {
            return Map.of();
        }

        java.util.Set<Long> savedIds = savedWordRepository.findByUserIdAndVocabularyIdIn(userId, normalizedIds).stream()
                .map(savedWord -> savedWord.getVocabulary().getId())
                .collect(Collectors.toSet());

        Map<Long, Boolean> statuses = new LinkedHashMap<>();
        normalizedIds.forEach(vocabularyId -> statuses.put(vocabularyId, savedIds.contains(vocabularyId)));
        return statuses;
    }

    public SavedWordStatsDto getStats(Long userId) {
        List<SavedWord> allWords = savedWordRepository.findByUserIdOrderByNextReviewAtAscCreatedAtDesc(userId);
        java.time.Instant now = java.time.Instant.now();

        long dueTodayCount = allWords.stream()
                .filter(savedWord -> savedWord.getNextReviewAt() == null
                        || !savedWord.getNextReviewAt().isAfter(now))
                .count();
        long kanjiDueTodayCount = allWords.stream()
                .filter(savedWord -> matchesMode(savedWord, "KANJI"))
                .filter(savedWord -> savedWord.getNextReviewAt() == null
                        || !savedWord.getNextReviewAt().isAfter(now))
                .count();

        List<String> folders = allWords.stream()
                .map(SavedWord::getFolderName)
                .filter(folder -> folder != null && !folder.isBlank())
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        return SavedWordStatsDto.builder()
                .totalSaved(allWords.size())
                .masteredCount(savedWordRepository.countByUserIdAndMastered(userId, true))
                .dueTodayCount(dueTodayCount)
                .kanjiDueTodayCount(kanjiDueTodayCount)
                .vocabularyDueTodayCount(Math.max(0, dueTodayCount - kanjiDueTodayCount))
                .folders(folders)
                .build();
    }

    private User findUserByIdOrThrow(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Vocabulary findVocabularyByIdOrThrow(Long vocabularyId) {
        return vocabularyRepository
                .findById(vocabularyId)
                .orElseThrow(() -> new ResourceNotFoundException("Vocabulary not found"));
    }

    private SavedWord findOwnedSavedWordOrThrow(Long savedWordId, Long userId) {
        SavedWord saved = savedWordRepository
                .findById(savedWordId)
                .orElseThrow(() -> new ResourceNotFoundException("Saved word not found"));

        if (!saved.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Not your saved word");
        }
        return saved;
    }

    private boolean matchesMode(SavedWord savedWord, String mode) {
        String normalizedMode =
                mode == null || mode.isBlank() ? "ALL" : mode.trim().toUpperCase(Locale.ROOT);
        if ("ALL".equals(normalizedMode)) {
            return true;
        }

        boolean hasKanji = savedWord.getVocabulary().getKanji() != null
                && HAN_PATTERN.matcher(savedWord.getVocabulary().getKanji()).find();

        if ("KANJI".equals(normalizedMode)) {
            return hasKanji;
        }

        if ("VOCABULARY".equals(normalizedMode)) {
            return !hasKanji;
        }

        return true;
    }

    private enum ReviewRating {
        AGAIN,
        HARD,
        GOOD,
        EASY;

        private static ReviewRating from(String value) {
            return ReviewRating.valueOf(value.trim().toUpperCase(Locale.ROOT));
        }
    }
}
