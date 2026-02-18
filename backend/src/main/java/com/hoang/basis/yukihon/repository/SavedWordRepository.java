package com.hoang.basis.yukihon.repository;

import com.hoang.basis.yukihon.model.SavedWord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedWordRepository extends JpaRepository<SavedWord, Long> {

    List<SavedWord> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<SavedWord> findByUserIdAndFolderNameOrderByCreatedAtDesc(Long userId, String folderName);

    List<SavedWord> findByUserIdAndMasteredOrderByCreatedAtDesc(Long userId, boolean mastered);

    Optional<SavedWord> findByUserIdAndVocabularyId(Long userId, Long vocabularyId);

    boolean existsByUserIdAndVocabularyId(Long userId, Long vocabularyId);

    long countByUserId(Long userId);

    long countByUserIdAndMastered(Long userId, boolean mastered);
}
