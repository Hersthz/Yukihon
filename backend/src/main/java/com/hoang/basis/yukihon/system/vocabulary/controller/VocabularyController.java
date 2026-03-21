package com.hoang.basis.yukihon.system.vocabulary.controller;

import com.hoang.basis.yukihon.system.vocabulary.dto.VocabularyDto;
import com.hoang.basis.yukihon.system.vocabulary.dto.VocabularyRequest;
import com.hoang.basis.yukihon.system.vocabulary.service.VocabularyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vocabulary")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.frontend-url:http://localhost:5173}")
public class VocabularyController {

    private final VocabularyService vocabularyService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('CONTENT_READ','CONTENT_MANAGE')")
    public ResponseEntity<List<VocabularyDto>> getAllVocabulary() {
        List<VocabularyDto> vocabulary = vocabularyService.getAll();
        return ResponseEntity.ok(vocabulary);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CONTENT_READ','CONTENT_MANAGE')")
    public ResponseEntity<VocabularyDto> getVocabularyById(@PathVariable Long id) {
        return ResponseEntity.ok(vocabularyService.getVocabularyById(id));
    }

    @GetMapping("/kanji/{kanji}")
    @PreAuthorize("hasAnyAuthority('CONTENT_READ','CONTENT_MANAGE')")
    public ResponseEntity<VocabularyDto> getVocabularyByKanji(@PathVariable String kanji) {
        return ResponseEntity.ok(vocabularyService.getVocabularyByKanji(kanji));
    }

    @GetMapping("/level/{jlptLevel}")
    @PreAuthorize("hasAnyAuthority('CONTENT_READ','CONTENT_MANAGE')")
    public ResponseEntity<List<VocabularyDto>> getByJlptLevel(@PathVariable String jlptLevel) {
        List<VocabularyDto> vocabulary = vocabularyService.getByJlptLevel(jlptLevel);
        return ResponseEntity.ok(vocabulary);
    }

    @GetMapping("/type/{wordType}")
    @PreAuthorize("hasAnyAuthority('CONTENT_READ','CONTENT_MANAGE')")
    public ResponseEntity<List<VocabularyDto>> getByWordType(@PathVariable String wordType) {
        List<VocabularyDto> vocabulary = vocabularyService.getByWordType(wordType);
        return ResponseEntity.ok(vocabulary);
    }

    @GetMapping("/levels")
    @PreAuthorize("hasAnyAuthority('CONTENT_READ','CONTENT_MANAGE')")
    public ResponseEntity<List<String>> getAllJlptLevels() {
        List<String> levels = vocabularyService.getAllJlptLevels();
        return ResponseEntity.ok(levels);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CONTENT_MANAGE')")
    public ResponseEntity<VocabularyDto> createVocabulary(@Valid @RequestBody VocabularyRequest request) {
        VocabularyDto vocabulary = vocabularyService.createVocabulary(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(vocabulary);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CONTENT_MANAGE')")
    public ResponseEntity<VocabularyDto> updateVocabulary(
            @PathVariable Long id,
            @Valid @RequestBody VocabularyRequest request
    ) {
        VocabularyDto updated = vocabularyService.updateVocabulary(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CONTENT_MANAGE')")
    public ResponseEntity<Void> deleteVocabulary(@PathVariable Long id) {
        vocabularyService.deleteVocabulary(id);
        return ResponseEntity.noContent().build();
    }
}
