package com.hoang.basis.yukihon.system.savedword.repository;

import com.hoang.basis.yukihon.system.savedword.entity.SavedWord;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SavedWordRepository extends JpaRepository<SavedWord, Long> {

    List<SavedWord> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<SavedWord> findByUserIdOrderByNextReviewAtAscCreatedAtDesc(Long userId);

    List<SavedWord> findByUserIdAndFolderNameOrderByCreatedAtDesc(Long userId, String folderName);

    List<SavedWord> findByUserIdAndMasteredOrderByCreatedAtDesc(Long userId, boolean mastered);

    List<SavedWord> findByUserIdAndNextReviewAtLessThanEqualOrderByNextReviewAtAscCreatedAtDesc(
            Long userId, Instant nextReviewAt);

    Optional<SavedWord> findByUserIdAndVocabularyId(Long userId, Long vocabularyId);

    List<SavedWord> findByUserIdAndVocabularyIdIn(Long userId, Collection<Long> vocabularyIds);

    boolean existsByUserIdAndVocabularyId(Long userId, Long vocabularyId);

    long countByUserId(Long userId);

    long countByUserIdAndMastered(Long userId, boolean mastered);
}
