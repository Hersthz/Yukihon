package com.hoang.basis.yukihon.system.aichat.controller;

import com.hoang.basis.yukihon.system.aichat.dto.AiChatRequest;
import com.hoang.basis.yukihon.system.aichat.dto.AiChatResponse;
import com.hoang.basis.yukihon.system.aichat.service.AiChatService;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai-chat")
@RequiredArgsConstructor
@Slf4j
public class AiChatController {

    private final AiChatService aiChatService;
    private final UserRepository userRepository;

    @PostMapping("/respond")
    public ResponseEntity<AiChatResponse> respond(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AiChatRequest request
    ) {
        Long userId = getUserId(userDetails);
        log.info("User {} requested AI chat response in mode={}", userId, request.getMode());
        return ResponseEntity.ok(aiChatService.respond(userId, request));
    }

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
