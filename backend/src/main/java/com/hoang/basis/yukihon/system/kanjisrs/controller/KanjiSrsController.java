package com.hoang.basis.yukihon.system.kanjisrs.controller;

import com.hoang.basis.yukihon.system.kanjisrs.dto.AddKanjiSrsRequest;
import com.hoang.basis.yukihon.system.kanjisrs.dto.ImportKanjiSrsRequest;
import com.hoang.basis.yukihon.system.kanjisrs.dto.KanjiSrsDashboardDto;
import com.hoang.basis.yukihon.system.kanjisrs.dto.KanjiSrsDto;
import com.hoang.basis.yukihon.system.kanjisrs.dto.ReviewKanjiSrsRequest;
import com.hoang.basis.yukihon.system.kanjisrs.service.KanjiSrsService;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kanji-srs")
@RequiredArgsConstructor
public class KanjiSrsController {

    private final KanjiSrsService kanjiSrsService;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new com.hoang.basis.yukihon.exception.ResourceNotFoundException("User not found"));
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<List<KanjiSrsDto>> getRecords(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(kanjiSrsService.getRecords(getUserId(userDetails)));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<KanjiSrsDashboardDto> getDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(kanjiSrsService.getDashboard(getUserId(userDetails)));
    }

    @PostMapping
    public ResponseEntity<KanjiSrsDto> addRecord(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AddKanjiSrsRequest request
    ) {
        return ResponseEntity.ok(kanjiSrsService.addRecord(getUserId(userDetails), request));
    }

    @PostMapping("/import")
    public ResponseEntity<List<KanjiSrsDto>> importRecords(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ImportKanjiSrsRequest request
    ) {
        return ResponseEntity.ok(kanjiSrsService.importRecords(getUserId(userDetails), request));
    }

    @PostMapping("/{character}/review")
    public ResponseEntity<KanjiSrsDto> reviewRecord(
            @PathVariable String character,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ReviewKanjiSrsRequest request
    ) {
        return ResponseEntity.ok(kanjiSrsService.reviewRecord(getUserId(userDetails), character, request));
    }

    @DeleteMapping("/{character}")
    public ResponseEntity<Void> removeRecord(
            @PathVariable String character,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        kanjiSrsService.removeRecord(getUserId(userDetails), character);
        return ResponseEntity.noContent().build();
    }
}
