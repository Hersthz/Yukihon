package com.hoang.basis.yukihon.service;

import com.hoang.basis.yukihon.dto.grammar.GrammarDto;
import com.hoang.basis.yukihon.dto.grammar.GrammarRequest;
import com.hoang.basis.yukihon.model.Grammar;
import com.hoang.basis.yukihon.repository.GrammarRepository;
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
public class GrammarService {

    private final GrammarRepository grammarRepository;

    @Transactional(readOnly = true)
    public GrammarDto getGrammarById(Long id) {
        return grammarRepository.findById(id)
                .map(this::convertToDto)
                .orElseThrow(() -> new RuntimeException("Grammar not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public GrammarDto getGrammarByPattern(String pattern) {
        return grammarRepository.findByPattern(pattern)
                .map(this::convertToDto)
                .orElseThrow(() -> new RuntimeException("Grammar not found with pattern: " + pattern));
    }

    @Transactional(readOnly = true)
    public List<GrammarDto> getAll() {
        return grammarRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GrammarDto> getByJlptLevel(String jlptLevel) {
        return grammarRepository.findByJlptLevel(jlptLevel)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GrammarDto> getByMultipleLevels(List<String> levels) {
        return grammarRepository.findByJlptLevelIn(levels)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getAllJlptLevels() {
        return grammarRepository.findAllJlptLevels();
    }

    public GrammarDto createGrammar(GrammarRequest request) {
        if (grammarRepository.findByPattern(request.getPattern()).isPresent()) {
            throw new RuntimeException("Grammar with pattern '" + request.getPattern() + "' already exists");
        }

        Grammar grammar = Grammar.builder()
                .title(request.getTitle())
                .pattern(request.getPattern())
                .explanation(request.getExplanation())
                .usage(request.getUsage())
                .exampleJP(request.getExampleJP())
                .exampleEN(request.getExampleEN())
                .jlptLevel(request.getJlptLevel())
                .relatedPatterns(request.getRelatedPatterns())
                .notes(request.getNotes())
                .build();

        Grammar saved = grammarRepository.save(grammar);
        log.info("Created grammar: {}", saved.getPattern());
        return convertToDto(saved);
    }

    public GrammarDto updateGrammar(Long id, GrammarRequest request) {
        Grammar grammar = grammarRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grammar not found with id: " + id));

        grammar.setTitle(request.getTitle());
        grammar.setExplanation(request.getExplanation());
        grammar.setUsage(request.getUsage());
        grammar.setExampleJP(request.getExampleJP());
        grammar.setExampleEN(request.getExampleEN());
        grammar.setJlptLevel(request.getJlptLevel());
        grammar.setRelatedPatterns(request.getRelatedPatterns());
        grammar.setNotes(request.getNotes());

        Grammar updated = grammarRepository.save(grammar);
        log.info("Updated grammar: {}", updated.getPattern());
        return convertToDto(updated);
    }

    public void deleteGrammar(Long id) {
        if (!grammarRepository.existsById(id)) {
            throw new RuntimeException("Grammar not found with id: " + id);
        }
        grammarRepository.deleteById(id);
        log.info("Deleted grammar with id: {}", id);
    }

    private GrammarDto convertToDto(Grammar grammar) {
        return GrammarDto.builder()
                .id(grammar.getId())
                .title(grammar.getTitle())
                .pattern(grammar.getPattern())
                .explanation(grammar.getExplanation())
                .usage(grammar.getUsage())
                .exampleJP(grammar.getExampleJP())
                .exampleEN(grammar.getExampleEN())
                .jlptLevel(grammar.getJlptLevel())
                .relatedPatterns(grammar.getRelatedPatterns())
                .notes(grammar.getNotes())
                .build();
    }
}
