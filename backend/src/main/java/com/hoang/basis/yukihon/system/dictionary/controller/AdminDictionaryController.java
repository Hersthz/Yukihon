package com.hoang.basis.yukihon.system.dictionary.controller;

import com.hoang.basis.yukihon.system.dictionary.service.JmdictImportService;
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

    @Value("${app.dictionary.jmdict.url:}")
    private String defaultJmdictUrl;

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
}
