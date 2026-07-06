package com.hoang.basis.yukihon.system.library.controller;

import com.hoang.basis.yukihon.base.security.CurrentUserId;
import com.hoang.basis.yukihon.system.library.dto.FlashcardTemplateDto;
import com.hoang.basis.yukihon.system.library.dto.TemplateUpsertRequest;
import com.hoang.basis.yukihon.system.library.service.FlashcardTemplateService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Card render templates (HTML front/back + CSS): system defaults + the user's own. */
@RestController
@RequestMapping("/api/flashcard-templates")
@RequiredArgsConstructor
public class FlashcardTemplateController {

    private final FlashcardTemplateService service;

    @GetMapping
    public ResponseEntity<List<FlashcardTemplateDto>> list(@CurrentUserId Long userId) {
        return ResponseEntity.ok(service.list(userId));
    }

    @GetMapping("/default")
    public ResponseEntity<FlashcardTemplateDto> getDefault(
            @RequestParam(required = false) String cardType, @CurrentUserId Long userId) {
        return ResponseEntity.ok(service.getDefault(userId, cardType));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlashcardTemplateDto> get(@PathVariable Long id, @CurrentUserId Long userId) {
        return ResponseEntity.ok(service.get(userId, id));
    }

    @PostMapping
    public ResponseEntity<FlashcardTemplateDto> create(
            @Valid @RequestBody TemplateUpsertRequest request, @CurrentUserId Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(userId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlashcardTemplateDto> update(
            @PathVariable Long id, @Valid @RequestBody TemplateUpsertRequest request, @CurrentUserId Long userId) {
        return ResponseEntity.ok(service.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @CurrentUserId Long userId) {
        service.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
