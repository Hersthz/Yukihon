package com.hoang.basis.yukihon.system.dictionary.controller;

import com.hoang.basis.yukihon.system.dictionary.service.JmdictImportService;
import com.hoang.basis.yukihon.system.dictionary.service.KradfileImportService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Admin-only dictionary maintenance (ADMIN role enforced by SecurityConfig on /api/admin/**). */
@RestController
@RequestMapping("/api/admin/dictionary")
@RequiredArgsConstructor
public class AdminDictionaryController {

    private final JmdictImportService jmdictImportService;
    private final KradfileImportService kradfileImportService;

    @Value("${app.dictionary.jmdict.url:}")
    private String defaultJmdictUrl;

    @Value("${app.dictionary.kradfile.url:}")
    private String defaultKradfileUrl;

    /**
     * Import JMdict from a jmdict-simplified release (.json/.zip/.gz). Uses the configured default
     * URL when none is given. Runs in the background; returns 202 immediately.
     */
    @PostMapping("/import/jmdict")
    public ResponseEntity<Map<String, String>> importJmdict(
            @RequestParam(required = false) String url, @RequestParam(defaultValue = "false") boolean force) {
        String source = (url != null && !url.isBlank()) ? url : defaultJmdictUrl;
        String message = jmdictImportService.startImport(source, force);
        return ResponseEntity.accepted().body(Map.of("message", message));
    }

    /**
     * Import the KRADFILE radical→kanji index (UTF-8 text, optionally .gz) for the radical picker.
     * Uses the configured default URL when none is given. Runs in the background; returns 202.
     */
    @PostMapping("/import/kradfile")
    public ResponseEntity<Map<String, String>> importKradfile(
            @RequestParam(required = false) String url, @RequestParam(defaultValue = "false") boolean force) {
        String source = (url != null && !url.isBlank()) ? url : defaultKradfileUrl;
        String message = kradfileImportService.startImport(source, force);
        return ResponseEntity.accepted().body(Map.of("message", message));
    }
}
