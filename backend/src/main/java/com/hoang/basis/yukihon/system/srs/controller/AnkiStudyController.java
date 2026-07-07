package com.hoang.basis.yukihon.system.srs.controller;

import com.hoang.basis.yukihon.base.security.CurrentUserId;
import com.hoang.basis.yukihon.system.srs.dto.AlgorithmConfigDto;
import com.hoang.basis.yukihon.system.srs.dto.AnkiReviewRequest;
import com.hoang.basis.yukihon.system.srs.dto.AnkiSrsSettingDto;
import com.hoang.basis.yukihon.system.srs.dto.AnkiStatsDto;
import com.hoang.basis.yukihon.system.srs.dto.AnkiStudyCardDto;
import com.hoang.basis.yukihon.system.srs.dto.AnkiStudyQueueDto;
import com.hoang.basis.yukihon.system.srs.dto.RescheduleResultDto;
import com.hoang.basis.yukihon.system.srs.service.AnkiStudyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    @GetMapping("/{deckId}/stats")
    public ResponseEntity<AnkiStatsDto> getStats(@PathVariable Long deckId, @CurrentUserId Long userId) {
        return ResponseEntity.ok(ankiStudyService.getStats(userId, deckId));
    }

    @GetMapping("/{deckId}/settings")
    public ResponseEntity<AnkiSrsSettingDto> getSettings(@PathVariable Long deckId, @CurrentUserId Long userId) {
        return ResponseEntity.ok(ankiStudyService.getSettings(userId, deckId));
    }

    @PutMapping("/{deckId}/settings")
    public ResponseEntity<AnkiSrsSettingDto> updateSettings(
            @PathVariable Long deckId, @RequestBody AnkiSrsSettingDto dto, @CurrentUserId Long userId) {
        return ResponseEntity.ok(ankiStudyService.updateSettings(userId, deckId, dto));
    }

    @GetMapping("/algorithms")
    public ResponseEntity<java.util.List<AlgorithmConfigDto>> listAlgorithms() {
        return ResponseEntity.ok(ankiStudyService.listAlgorithms());
    }

    @PostMapping("/{deckId}/algorithm")
    public ResponseEntity<AnkiSrsSettingDto> switchAlgorithm(
            @PathVariable Long deckId, @RequestBody SwitchAlgorithmRequest body, @CurrentUserId Long userId) {
        return ResponseEntity.ok(ankiStudyService.switchAlgorithm(userId, deckId, body.algorithmType()));
    }

    @PostMapping("/{deckId}/reschedule")
    public ResponseEntity<RescheduleResultDto> reschedule(
            @PathVariable Long deckId,
            @RequestParam(value = "dryRun", required = false, defaultValue = "false") boolean dryRun,
            @CurrentUserId Long userId) {
        return ResponseEntity.ok(ankiStudyService.reschedule(userId, deckId, dryRun));
    }

    @PostMapping("/{deckId}/cards/{flashcardId}/suspend")
    public ResponseEntity<Void> setSuspended(
            @PathVariable Long deckId,
            @PathVariable Long flashcardId,
            @RequestBody SuspendRequest body,
            @CurrentUserId Long userId) {
        ankiStudyService.setCardSuspended(userId, deckId, flashcardId, Boolean.TRUE.equals(body.suspended()));
        return ResponseEntity.noContent().build();
    }

    /** Body for suspend toggle. */
    public record SuspendRequest(Boolean suspended) {}

    /** Body for switching a deck's scheduling algorithm. */
    public record SwitchAlgorithmRequest(String algorithmType) {}
}
