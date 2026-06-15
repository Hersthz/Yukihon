package com.hoang.basis.yukihon.system.srs.controller;

import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.srs.dto.AnkiReviewRequest;
import com.hoang.basis.yukihon.system.srs.dto.AnkiStudyCardDto;
import com.hoang.basis.yukihon.system.srs.dto.AnkiStudyQueueDto;
import com.hoang.basis.yukihon.system.srs.service.AnkiStudyService;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }

    @GetMapping("/{deckId}")
    public ResponseEntity<AnkiStudyQueueDto> getQueue(
            @PathVariable Long deckId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ankiStudyService.getStudyQueue(getUserId(userDetails), deckId));
    }

    @PostMapping("/review")
    public ResponseEntity<AnkiStudyCardDto> review(
            @Valid @RequestBody AnkiReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ankiStudyService.review(getUserId(userDetails), request));
    }
}
