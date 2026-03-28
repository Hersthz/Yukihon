package com.hoang.basis.yukihon.system.mistakedna.controller;

import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.mistakedna.dto.MistakeDnaDto;
import com.hoang.basis.yukihon.system.mistakedna.service.MistakeDnaService;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mistake-dna")
@RequiredArgsConstructor
public class MistakeDnaController {

    private final MistakeDnaService mistakeDnaService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<MistakeDnaDto> getCurrentUserMistakeDna(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = resolveCurrentUserId(userDetails);
        return ResponseEntity.ok(mistakeDnaService.getMistakeDna(userId));
    }

    private Long resolveCurrentUserId(UserDetails userDetails) {
        if (userDetails == null || userDetails.getUsername() == null) {
            throw new AccessDeniedException("Authentication required");
        }

        return userRepository.findByEmail(userDetails.getUsername().toLowerCase())
                .map(user -> user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
