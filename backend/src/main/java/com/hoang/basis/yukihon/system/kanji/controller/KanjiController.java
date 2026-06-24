package com.hoang.basis.yukihon.system.kanji.controller;

import com.hoang.basis.yukihon.system.kanji.dto.KanjiInfoDto;
import com.hoang.basis.yukihon.system.kanji.service.KanjiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Kanji metadata lookup (cache-on-demand from kanjiapi.dev). */
@RestController
@RequestMapping("/api/kanji")
@RequiredArgsConstructor
public class KanjiController {

    private final KanjiService kanjiService;

    @GetMapping("/{character}")
    public ResponseEntity<KanjiInfoDto> getKanji(@PathVariable String character) {
        return ResponseEntity.ok(kanjiService.getKanji(character));
    }
}
