package com.hoang.basis.yukihon.system.dictionary.controller;

import com.hoang.basis.yukihon.base.security.CurrentUserId;
import com.hoang.basis.yukihon.system.dictionary.dto.CreateContributionRequest;
import com.hoang.basis.yukihon.system.dictionary.dto.DictContributionDto;
import com.hoang.basis.yukihon.system.dictionary.dto.VoteRequest;
import com.hoang.basis.yukihon.system.dictionary.service.DictContributionService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Community meanings/examples for dictionary words, with voting. */
@RestController
@RequestMapping("/api/dictionary/contributions")
@RequiredArgsConstructor
public class DictContributionController {

    private final DictContributionService service;

    @GetMapping
    public ResponseEntity<List<DictContributionDto>> list(@RequestParam String word, @CurrentUserId Long userId) {
        return ResponseEntity.ok(service.list(userId, word));
    }

    @PostMapping
    public ResponseEntity<DictContributionDto> create(
            @Valid @RequestBody CreateContributionRequest request, @CurrentUserId Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(userId, request));
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<DictContributionDto> vote(
            @PathVariable Long id, @RequestBody VoteRequest request, @CurrentUserId Long userId) {
        return ResponseEntity.ok(service.vote(userId, id, request.value()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @CurrentUserId Long userId) {
        service.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
