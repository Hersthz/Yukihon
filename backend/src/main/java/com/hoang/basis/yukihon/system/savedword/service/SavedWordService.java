package com.hoang.basis.yukihon.system.savedword.service;

import com.hoang.basis.yukihon.system.savedword.dto.SaveWordRequest;
import com.hoang.basis.yukihon.system.savedword.dto.SavedWordDto;
import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.vocabulary.entity.Vocabulary;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import com.hoang.basis.yukihon.system.vocabulary.repository.VocabularyRepository;
import com.hoang.basis.yukihon.system.savedword.entity.SavedWord;
import com.hoang.basis.yukihon.system.savedword.repository.SavedWordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SavedWordService {

    private final SavedWordRepository savedWordRepository;
    private final UserRepository userRepository;
    private final VocabularyRepository vocabularyRepository;

    public List<SavedWordDto> getUserSavedWords(Long userId) {
        return savedWordRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
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

    @Transactional
    public SavedWordDto saveWord(Long userId, SaveWordRequest request) {
        if (savedWordRepository.existsByUserIdAndVocabularyId(userId, request.getVocabularyId())) {
            throw new IllegalArgumentException("Word already saved");
        }

        User user = findUserByIdOrThrow(userId);
        Vocabulary vocab = findVocabularyByIdOrThrow(request.getVocabularyId());

        SavedWord savedWord = SavedWord.builder()
                .user(user)
                .vocabulary(vocab)
                .folderName(request.getFolderName() != null ? request.getFolderName() : "Default")
                .personalNote(request.getPersonalNote())
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

    public long getCount(Long userId) {
        return savedWordRepository.countByUserId(userId);
    }

    public long getMasteredCount(Long userId) {
        return savedWordRepository.countByUserIdAndMastered(userId, true);
    }

    private User findUserByIdOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Vocabulary findVocabularyByIdOrThrow(Long vocabularyId) {
        return vocabularyRepository.findById(vocabularyId)
                .orElseThrow(() -> new ResourceNotFoundException("Vocabulary not found"));
    }

    private SavedWord findOwnedSavedWordOrThrow(Long savedWordId, Long userId) {
        SavedWord saved = savedWordRepository.findById(savedWordId)
                .orElseThrow(() -> new ResourceNotFoundException("Saved word not found"));

        if (!saved.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Not your saved word");
        }
        return saved;
    }
}
