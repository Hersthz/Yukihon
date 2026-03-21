package com.hoang.basis.yukihon.system.dictionary.service;

import com.hoang.basis.yukihon.system.vocabulary.dto.VocabularyDto;
import com.hoang.basis.yukihon.system.vocabulary.entity.Vocabulary;
import com.hoang.basis.yukihon.system.vocabulary.repository.VocabularyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DictionaryService {

    private final VocabularyRepository vocabularyRepository;

    /**
     * Search vocabulary by kanji, hiragana, romaji, or meaning
     */
    public List<VocabularyDto> search(String query) {
        log.info("Dictionary search: {}", query);
        String q = query == null ? "" : query.trim();

        if (q.isEmpty()) {
            return List.of();
        }

        return vocabularyRepository.searchForDictionary(q, PageRequest.of(0, 50)).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get vocabulary detail by ID
     */
    public VocabularyDto getById(Long id) {
        Vocabulary v = vocabularyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vocabulary not found"));
        return toDto(v);
    }

    private VocabularyDto toDto(Vocabulary v) {
        VocabularyDto dto = new VocabularyDto();
        dto.setId(v.getId());
        dto.setKanji(v.getKanji());
        dto.setHiragana(v.getHiragana());
        dto.setRomaji(v.getRomaji());
        dto.setMeaning(v.getMeaning());
        dto.setExampleSentenceJP(v.getExampleSentenceJP());
        dto.setExampleSentenceEN(v.getExampleSentenceEN());
        dto.setWordType(v.getWordType());
        dto.setJlptLevel(v.getJlptLevel());
        dto.setAdditionalNotes(v.getAdditionalNotes());
        return dto;
    }
}
