package com.hoang.basis.yukihon.system.grammar.controller;

import com.hoang.basis.yukihon.system.grammar.dto.GrammarDto;
import com.hoang.basis.yukihon.system.grammar.dto.GrammarRequest;
import com.hoang.basis.yukihon.system.grammar.service.GrammarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grammar")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.frontend-url:http://localhost:5173}")
public class GrammarController {

    private final GrammarService grammarService;

    @GetMapping
    public ResponseEntity<List<GrammarDto>> getAllGrammar() {
        List<GrammarDto> grammar = grammarService.getAll();
        return ResponseEntity.ok(grammar);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GrammarDto> getGrammarById(@PathVariable Long id) {
        return ResponseEntity.ok(grammarService.getGrammarById(id));
    }

    @GetMapping("/pattern/{pattern}")
    public ResponseEntity<GrammarDto> getGrammarByPattern(@PathVariable String pattern) {
        return ResponseEntity.ok(grammarService.getGrammarByPattern(pattern));
    }

    @GetMapping("/level/{jlptLevel}")
    public ResponseEntity<List<GrammarDto>> getByJlptLevel(@PathVariable String jlptLevel) {
        List<GrammarDto> grammar = grammarService.getByJlptLevel(jlptLevel);
        return ResponseEntity.ok(grammar);
    }

    @GetMapping("/levels")
    public ResponseEntity<List<String>> getAllJlptLevels() {
        List<String> levels = grammarService.getAllJlptLevels();
        return ResponseEntity.ok(levels);
    }

    @PostMapping
    public ResponseEntity<GrammarDto> createGrammar(@Valid @RequestBody GrammarRequest request) {
        GrammarDto grammar = grammarService.createGrammar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(grammar);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GrammarDto> updateGrammar(
            @PathVariable Long id,
            @Valid @RequestBody GrammarRequest request
    ) {
        GrammarDto updated = grammarService.updateGrammar(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGrammar(@PathVariable Long id) {
        grammarService.deleteGrammar(id);
        return ResponseEntity.noContent().build();
    }
}
