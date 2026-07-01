package com.hoang.basis.yukihon.system.mistakedna.controller;

import com.hoang.basis.yukihon.base.security.CurrentUserId;
import com.hoang.basis.yukihon.system.mistakedna.dto.MistakeDnaDto;
import com.hoang.basis.yukihon.system.mistakedna.service.MistakeDnaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mistake-dna")
@RequiredArgsConstructor
public class MistakeDnaController {

    private final MistakeDnaService mistakeDnaService;

    @GetMapping
    public ResponseEntity<MistakeDnaDto> getCurrentUserMistakeDna(@CurrentUserId Long userId) {
        return ResponseEntity.ok(mistakeDnaService.getMistakeDna(userId));
    }
}
