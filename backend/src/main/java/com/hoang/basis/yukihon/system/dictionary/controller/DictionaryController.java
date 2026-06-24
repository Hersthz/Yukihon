package com.hoang.basis.yukihon.system.dictionary.controller;

import com.hoang.basis.yukihon.system.dictionary.dto.ExampleSentenceDto;
import com.hoang.basis.yukihon.system.dictionary.service.DictionaryService;
import com.hoang.basis.yukihon.system.vocabulary.dto.VocabularyDto;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dictionary")
@RequiredArgsConstructor
public class DictionaryController {

    private final DictionaryService dictionaryService;

    @GetMapping("/search")
    public ResponseEntity<List<VocabularyDto>> search(@RequestParam String q) {
        return ResponseEntity.ok(dictionaryService.search(q));
    }

    /** Example sentences (JP + VN/EN) for a word, cached on demand from Tatoeba. */
    @GetMapping("/examples")
    public ResponseEntity<List<ExampleSentenceDto>> examples(@RequestParam String q) {
        return ResponseEntity.ok(dictionaryService.getExamples(q));
    }

    /** Translate a JMdict word's English meaning to Vietnamese (cached on the entry). */
    @PostMapping("/words/{dictWordId}/translate")
    public ResponseEntity<Map<String, String>> translate(@PathVariable Long dictWordId) {
        return ResponseEntity.ok(Map.of("vi", dictionaryService.translateToVietnamese(dictWordId)));
    }

    /** Promote a JMdict word into the curated vocabulary so it can be saved to My Words. */
    @PostMapping("/words/{dictWordId}/materialize")
    public ResponseEntity<VocabularyDto> materialize(@PathVariable Long dictWordId) {
        return ResponseEntity.ok(dictionaryService.materialize(dictWordId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VocabularyDto> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(dictionaryService.getById(id));
    }
}
