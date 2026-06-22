package com.hoang.basis.yukihon.system.aichat.controller;

import com.hoang.basis.yukihon.system.aichat.dto.AiChatConversationDto;
import com.hoang.basis.yukihon.system.aichat.dto.AiChatConversationUpdateRequest;
import com.hoang.basis.yukihon.system.aichat.dto.AiChatHistoryItemDto;
import com.hoang.basis.yukihon.system.aichat.dto.AiChatRequest;
import com.hoang.basis.yukihon.system.aichat.dto.AiChatResponse;
import com.hoang.basis.yukihon.system.aichat.service.AiChatService;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.util.List;

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

    @PostMapping(value = "/respond/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<StreamingResponseBody> streamRespond(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AiChatRequest request
    ) {
        Long userId = getUserId(userDetails);
        log.info("User {} requested streaming AI chat response in mode={}", userId, request.getMode());
        return ResponseEntity.ok(aiChatService.streamRespond(userId, request));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<AiChatConversationDto>> getConversations(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(aiChatService.getConversations(userId));
    }

    @PostMapping("/conversations")
    public ResponseEntity<AiChatConversationDto> createConversation(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(aiChatService.createConversation(userId));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<AiChatHistoryItemDto>> getConversationMessages(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long conversationId
    ) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(aiChatService.getConversationMessages(userId, conversationId));
    }

    @PatchMapping("/conversations/{conversationId}")
    public ResponseEntity<AiChatConversationDto> renameConversation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long conversationId,
            @Valid @RequestBody AiChatConversationUpdateRequest request
    ) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(aiChatService.renameConversation(userId, conversationId, request));
    }

    @DeleteMapping("/conversations/{conversationId}")
    public ResponseEntity<Void> deleteConversation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long conversationId
    ) {
        Long userId = getUserId(userDetails);
        aiChatService.deleteConversation(userId, conversationId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/history")
    public ResponseEntity<List<AiChatHistoryItemDto>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(aiChatService.getHistory(userId));
    }

    @DeleteMapping("/history")
    public ResponseEntity<Void> clearHistory(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = getUserId(userDetails);
        aiChatService.clearHistory(userId);
        return ResponseEntity.noContent().build();
    }

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new com.hoang.basis.yukihon.exception.ResourceNotFoundException("User not found"));
        return user.getId();
    }
}
