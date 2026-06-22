package com.hoang.basis.yukihon.system.kanjisrs.controller;

import com.hoang.basis.yukihon.base.security.CurrentUserId;
import com.hoang.basis.yukihon.system.kanjisrs.dto.AddKanjiSrsRequest;
import com.hoang.basis.yukihon.system.kanjisrs.dto.ImportKanjiSrsRequest;
import com.hoang.basis.yukihon.system.kanjisrs.dto.KanjiSrsDashboardDto;
import com.hoang.basis.yukihon.system.kanjisrs.dto.KanjiSrsDto;
import com.hoang.basis.yukihon.system.kanjisrs.dto.ReviewKanjiSrsRequest;
import com.hoang.basis.yukihon.system.kanjisrs.service.KanjiSrsService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/kanji-srs")
@RequiredArgsConstructor
public class KanjiSrsController {

    private final KanjiSrsService kanjiSrsService;

    @GetMapping
    public ResponseEntity<List<KanjiSrsDto>> getRecords(@CurrentUserId Long userId) {
        return ResponseEntity.ok(kanjiSrsService.getRecords(userId));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<KanjiSrsDashboardDto> getDashboard(@CurrentUserId Long userId) {
        return ResponseEntity.ok(kanjiSrsService.getDashboard(userId));
    }

    @PostMapping
    public ResponseEntity<KanjiSrsDto> addRecord(
            @CurrentUserId Long userId, @Valid @RequestBody AddKanjiSrsRequest request) {
        return ResponseEntity.ok(kanjiSrsService.addRecord(userId, request));
    }

    @PostMapping("/import")
    public ResponseEntity<List<KanjiSrsDto>> importRecords(
            @CurrentUserId Long userId, @Valid @RequestBody ImportKanjiSrsRequest request) {
        return ResponseEntity.ok(kanjiSrsService.importRecords(userId, request));
    }

    @PostMapping("/{character}/review")
    public ResponseEntity<KanjiSrsDto> reviewRecord(
            @PathVariable String character,
            @CurrentUserId Long userId,
            @Valid @RequestBody ReviewKanjiSrsRequest request) {
        return ResponseEntity.ok(kanjiSrsService.reviewRecord(userId, character, request));
    }

    @DeleteMapping("/{character}")
    public ResponseEntity<Void> removeRecord(@PathVariable String character, @CurrentUserId Long userId) {
        kanjiSrsService.removeRecord(userId, character);
        return ResponseEntity.noContent().build();
    }
}
