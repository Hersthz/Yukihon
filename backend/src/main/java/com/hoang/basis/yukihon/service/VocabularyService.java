package com.hoang.basis.yukihon.service;

import com.hoang.basis.yukihon.dto.vocabulary.VocabularyDto;
import com.hoang.basis.yukihon.dto.vocabulary.VocabularyRequest;
import com.hoang.basis.yukihon.model.Vocabulary;
import com.hoang.basis.yukihon.repository.VocabularyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class VocabularyService {

    private final VocabularyRepository vocabularyRepository;

    @Transactional(readOnly = true)
    public VocabularyDto getVocabularyById(Long id) {
        return vocabularyRepository.findById(id)
                .map(this::convertToDto)
                .orElseThrow(() -> new RuntimeException("Vocabulary not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public VocabularyDto getVocabularyByKanji(String kanji) {
        return vocabularyRepository.findByKanji(kanji)
                .map(this::convertToDto)
                .orElseThrow(() -> new RuntimeException("Vocabulary not found with kanji: " + kanji));
    }

    @Transactional(readOnly = true)
    public List<VocabularyDto> getAll() {
        return vocabularyRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VocabularyDto> getByJlptLevel(String jlptLevel) {
        return vocabularyRepository.findByJlptLevel(jlptLevel)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VocabularyDto> getByWordType(String wordType) {
        return vocabularyRepository.findByWordType(wordType)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VocabularyDto> getByMultipleLevels(List<String> levels) {
        return vocabularyRepository.findByJlptLevelIn(levels)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getAllJlptLevels() {
        return vocabularyRepository.findAllJlptLevels();
    }

    public VocabularyDto createVocabulary(VocabularyRequest request) {
        if (vocabularyRepository.findByKanji(request.getKanji()).isPresent()) {
            throw new RuntimeException("Vocabulary with kanji '" + request.getKanji() + "' already exists");
        }

        Vocabulary vocabulary = Vocabulary.builder()
                .kanji(request.getKanji())
                .hiragana(request.getHiragana())
                .romaji(request.getRomaji())
                .meaning(request.getMeaning())
                .exampleSentenceJP(request.getExampleSentenceJP())
                .exampleSentenceEN(request.getExampleSentenceEN())
                .wordType(request.getWordType())
                .jlptLevel(request.getJlptLevel())
                .additionalNotes(request.getAdditionalNotes())
                .build();

        Vocabulary saved = vocabularyRepository.save(vocabulary);
        log.info("Created vocabulary: {}", saved.getKanji());
        return convertToDto(saved);
    }

    public VocabularyDto updateVocabulary(Long id, VocabularyRequest request) {
        Vocabulary vocabulary = vocabularyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vocabulary not found with id: " + id));

        vocabulary.setHiragana(request.getHiragana());
        vocabulary.setRomaji(request.getRomaji());
        vocabulary.setMeaning(request.getMeaning());
        vocabulary.setExampleSentenceJP(request.getExampleSentenceJP());
        vocabulary.setExampleSentenceEN(request.getExampleSentenceEN());
        vocabulary.setWordType(request.getWordType());
        vocabulary.setJlptLevel(request.getJlptLevel());
        vocabulary.setAdditionalNotes(request.getAdditionalNotes());

        Vocabulary updated = vocabularyRepository.save(vocabulary);
        log.info("Updated vocabulary: {}", updated.getKanji());
        return convertToDto(updated);
    }

    public void deleteVocabulary(Long id) {
        if (!vocabularyRepository.existsById(id)) {
            throw new RuntimeException("Vocabulary not found with id: " + id);
        }
        vocabularyRepository.deleteById(id);
        log.info("Deleted vocabulary with id: {}", id);
    }

    private VocabularyDto convertToDto(Vocabulary vocabulary) {
        return VocabularyDto.builder()
                .id(vocabulary.getId())
                .kanji(vocabulary.getKanji())
                .hiragana(vocabulary.getHiragana())
                .romaji(vocabulary.getRomaji())
                .meaning(vocabulary.getMeaning())
                .exampleSentenceJP(vocabulary.getExampleSentenceJP())
                .exampleSentenceEN(vocabulary.getExampleSentenceEN())
                .wordType(vocabulary.getWordType())
                .jlptLevel(vocabulary.getJlptLevel())
                .additionalNotes(vocabulary.getAdditionalNotes())
                .build();
    }
}
