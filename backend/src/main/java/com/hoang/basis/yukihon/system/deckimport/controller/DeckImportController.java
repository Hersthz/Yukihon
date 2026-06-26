package com.hoang.basis.yukihon.system.deckimport.controller;

import com.hoang.basis.yukihon.base.security.CurrentUserId;
import com.hoang.basis.yukihon.system.deckimport.dto.ImportConfirmRequest;
import com.hoang.basis.yukihon.system.deckimport.dto.ImportPreviewResponse;
import com.hoang.basis.yukihon.system.deckimport.dto.ImportResultResponse;
import com.hoang.basis.yukihon.system.deckimport.service.DeckImportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** Bulk deck import from CSV/TSV/TXT: preview columns, then confirm to create a deck + cards. */
@RestController
@RequestMapping("/api/import")
@RequiredArgsConstructor
public class DeckImportController {

    private final DeckImportService deckImportService;

    @PostMapping(value = "/preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImportPreviewResponse> preview(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "delimiter", required = false, defaultValue = "AUTO") String delimiter) {
        return ResponseEntity.ok(deckImportService.preview(file, delimiter));
    }

    @PostMapping("/confirm")
    public ResponseEntity<ImportResultResponse> confirm(
            @Valid @RequestBody ImportConfirmRequest request, @CurrentUserId Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(deckImportService.confirm(userId, request));
    }

    @GetMapping(value = "/sample", produces = "text/csv; charset=UTF-8")
    public ResponseEntity<String> sample() {
        String csv = "front,back,hint\n" + "犬,chó,inu\n" + "猫,mèo,neko\n" + "学校,trường học,gakkou\n";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"yukihon-deck-template.csv\"")
                .body(csv);
    }
}
