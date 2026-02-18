package com.hoang.basis.yukihon.service;

import com.hoang.basis.yukihon.dto.vocabulary.VocabularyDto;
import com.hoang.basis.yukihon.model.Vocabulary;
import com.hoang.basis.yukihon.repository.VocabularyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
        String q = query.trim().toLowerCase();

        return vocabularyRepository.findAll().stream()
                .filter(v ->
                        (v.getKanji() != null && v.getKanji().contains(q)) ||
                        (v.getHiragana() != null && v.getHiragana().contains(q)) ||
                        (v.getRomaji() != null && v.getRomaji().toLowerCase().contains(q)) ||
                        (v.getMeaning() != null && v.getMeaning().toLowerCase().contains(q))
                )
                .limit(50)
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
