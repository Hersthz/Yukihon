package com.hoang.basis.yukihon.system.srs.controller;

import com.hoang.basis.yukihon.base.security.CurrentUserId;
import com.hoang.basis.yukihon.system.srs.dto.AnkiReviewRequest;
import com.hoang.basis.yukihon.system.srs.dto.AnkiStudyCardDto;
import com.hoang.basis.yukihon.system.srs.dto.AnkiStudyQueueDto;
import com.hoang.basis.yukihon.system.srs.service.AnkiStudyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Anki-style study endpoints: load the due queue and submit a rating. */
@RestController
@RequestMapping("/api/anki/study")
@RequiredArgsConstructor
public class AnkiStudyController {

    private final AnkiStudyService ankiStudyService;

    @GetMapping("/{deckId}")
    public ResponseEntity<AnkiStudyQueueDto> getQueue(@PathVariable Long deckId, @CurrentUserId Long userId) {
        return ResponseEntity.ok(ankiStudyService.getStudyQueue(userId, deckId));
    }

    @PostMapping("/review")
    public ResponseEntity<AnkiStudyCardDto> review(
            @Valid @RequestBody AnkiReviewRequest request, @CurrentUserId Long userId) {
        return ResponseEntity.ok(ankiStudyService.review(userId, request));
    }
}
