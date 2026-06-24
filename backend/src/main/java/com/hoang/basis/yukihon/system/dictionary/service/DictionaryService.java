package com.hoang.basis.yukihon.system.dictionary.service;

import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.dictionary.client.TatoebaClient;
import com.hoang.basis.yukihon.system.dictionary.dto.ExampleSentenceDto;
import com.hoang.basis.yukihon.system.dictionary.entity.DictSentence;
import com.hoang.basis.yukihon.system.dictionary.entity.DictWord;
import com.hoang.basis.yukihon.system.dictionary.repository.DictSentenceRepository;
import com.hoang.basis.yukihon.system.dictionary.repository.DictWordRepository;
import com.hoang.basis.yukihon.system.vocabulary.dto.VocabularyDto;
import com.hoang.basis.yukihon.system.vocabulary.entity.Vocabulary;
import com.hoang.basis.yukihon.system.vocabulary.repository.VocabularyRepository;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DictionaryService {

    private final VocabularyRepository vocabularyRepository;
    private final DictWordRepository dictWordRepository;
    private final DictSentenceRepository dictSentenceRepository;
    private final TatoebaClient tatoebaClient;

    @Value("${app.dictionary.examples-limit:6}")
    private int examplesLimit;

    @Value("${app.dictionary.external-enabled:true}")
    private boolean externalEnabled;

    /**
     * Search vocabulary by kanji, hiragana, romaji, or meaning
     */
    public List<VocabularyDto> search(String query) {
        log.info("Dictionary search: {}", query);
        String q = query == null ? "" : query.trim();

        if (q.isEmpty()) {
            return List.of();
        }

        // Curated local vocabulary first (Vietnamese meanings), then JMdict for full coverage,
        // skipping JMdict entries that duplicate a curated word.
        List<VocabularyDto> result = vocabularyRepository.searchForDictionary(q, PageRequest.of(0, 50)).stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        Set<String> seen = result.stream().map(this::dedupeKey).collect(Collectors.toCollection(HashSet::new));
        for (DictWord w : dictWordRepository.search(q, PageRequest.of(0, 50))) {
            VocabularyDto dto = toDto(w);
            if (seen.add(dedupeKey(dto)) && result.size() < 50) {
                result.add(dto);
            }
        }
        return result;
    }

    private String dedupeKey(VocabularyDto dto) {
        return (dto.getKanji() == null ? "" : dto.getKanji()) + "|"
                + (dto.getHiragana() == null ? "" : dto.getHiragana());
    }

    /** Map a JMdict entry to the shared DTO. Synthetic negative id marks it as not-yet-curated. */
    private VocabularyDto toDto(DictWord w) {
        VocabularyDto dto = new VocabularyDto();
        dto.setId(-w.getId());
        dto.setKanji(w.getKanji());
        dto.setHiragana(w.getKana());
        dto.setRomaji(w.getRomaji());
        dto.setMeaning(w.getGlossesEn());
        dto.setWordType(w.getPartOfSpeech());
        return dto;
    }

    /**
     * Get vocabulary detail by ID
     */
    public VocabularyDto getById(Long id) {
        Vocabulary v = vocabularyRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vocabulary not found: " + id));
        return toDto(v);
    }

    /**
     * Example sentences (JP + VN/EN) for a word. Cache-on-demand: served from dict_sentence if
     * present, otherwise fetched once from Tatoeba (Vietnamese + English), persisted, and returned.
     */
    @Transactional
    public List<ExampleSentenceDto> getExamples(String word) {
        String q = word == null ? "" : word.trim();
        if (q.isEmpty()) {
            return List.of();
        }

        List<DictSentence> cached = dictSentenceRepository.findByQueryWordOrderById(q);
        if (!cached.isEmpty()) {
            return cached.stream().map(this::toExampleDto).collect(Collectors.toList());
        }
        if (!externalEnabled) {
            return List.of();
        }

        // Fetch Vietnamese first (priority for this app), then English as a complement/fallback.
        Map<Long, DictSentence> merged = new LinkedHashMap<>();
        for (TatoebaClient.TatoebaResult r : tatoebaClient.search(q, "vie", examplesLimit)) {
            merged.computeIfAbsent(r.jpnId(), id -> newSentence(q, id, r.jpnText()))
                    .setVieText(r.translation());
        }
        for (TatoebaClient.TatoebaResult r : tatoebaClient.search(q, "eng", examplesLimit)) {
            merged.computeIfAbsent(r.jpnId(), id -> newSentence(q, id, r.jpnText()))
                    .setEngText(r.translation());
        }
        if (merged.isEmpty()) {
            return List.of();
        }

        List<DictSentence> toSave =
                merged.values().stream().limit(examplesLimit).collect(Collectors.toList());
        dictSentenceRepository.saveAll(toSave);
        return toSave.stream().map(this::toExampleDto).collect(Collectors.toList());
    }

    private DictSentence newSentence(String word, Long jpnId, String jpnText) {
        return DictSentence.builder()
                .queryWord(word)
                .tatoebaJpnId(jpnId)
                .jpnText(jpnText)
                .build();
    }

    private ExampleSentenceDto toExampleDto(DictSentence s) {
        return new ExampleSentenceDto(s.getTatoebaJpnId(), s.getJpnText(), s.getVieText(), s.getEngText());
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
