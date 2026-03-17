package com.hoang.basis.yukihon.system.dictionary.controller;

import com.hoang.basis.yukihon.system.vocabulary.dto.VocabularyDto;
import com.hoang.basis.yukihon.system.dictionary.service.DictionaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dictionary")
@RequiredArgsConstructor
public class DictionaryController {

    private final DictionaryService dictionaryService;

    @GetMapping("/search")
    public ResponseEntity<List<VocabularyDto>> search(@RequestParam String q) {
        return ResponseEntity.ok(dictionaryService.search(q));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VocabularyDto> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(dictionaryService.getById(id));
    }
}
