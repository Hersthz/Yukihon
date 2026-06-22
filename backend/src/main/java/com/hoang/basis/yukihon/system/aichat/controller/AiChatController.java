package com.hoang.basis.yukihon.system.aichat.controller;

import com.hoang.basis.yukihon.base.security.CurrentUserId;
import com.hoang.basis.yukihon.system.aichat.dto.AiChatConversationDto;
import com.hoang.basis.yukihon.system.aichat.dto.AiChatConversationUpdateRequest;
import com.hoang.basis.yukihon.system.aichat.dto.AiChatHistoryItemDto;
import com.hoang.basis.yukihon.system.aichat.dto.AiChatRequest;
import com.hoang.basis.yukihon.system.aichat.dto.AiChatResponse;
import com.hoang.basis.yukihon.system.aichat.service.AiChatService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@RestController
@RequestMapping("/api/ai-chat")
@RequiredArgsConstructor
@Slf4j
public class AiChatController {

    private final AiChatService aiChatService;

    @PostMapping("/respond")
    public ResponseEntity<AiChatResponse> respond(
            @CurrentUserId Long userId, @Valid @RequestBody AiChatRequest request) {
        log.info("User {} requested AI chat response in mode={}", userId, request.getMode());
        return ResponseEntity.ok(aiChatService.respond(userId, request));
    }

    @PostMapping(value = "/respond/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<StreamingResponseBody> streamRespond(
            @CurrentUserId Long userId, @Valid @RequestBody AiChatRequest request) {
        log.info("User {} requested streaming AI chat response in mode={}", userId, request.getMode());
        return ResponseEntity.ok(aiChatService.streamRespond(userId, request));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<AiChatConversationDto>> getConversations(@CurrentUserId Long userId) {
        return ResponseEntity.ok(aiChatService.getConversations(userId));
    }

    @PostMapping("/conversations")
    public ResponseEntity<AiChatConversationDto> createConversation(@CurrentUserId Long userId) {
        return ResponseEntity.ok(aiChatService.createConversation(userId));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<AiChatHistoryItemDto>> getConversationMessages(
            @CurrentUserId Long userId, @PathVariable Long conversationId) {
        return ResponseEntity.ok(aiChatService.getConversationMessages(userId, conversationId));
    }

    @PatchMapping("/conversations/{conversationId}")
    public ResponseEntity<AiChatConversationDto> renameConversation(
            @CurrentUserId Long userId,
            @PathVariable Long conversationId,
            @Valid @RequestBody AiChatConversationUpdateRequest request) {
        return ResponseEntity.ok(aiChatService.renameConversation(userId, conversationId, request));
    }

    @DeleteMapping("/conversations/{conversationId}")
    public ResponseEntity<Void> deleteConversation(@CurrentUserId Long userId, @PathVariable Long conversationId) {
        aiChatService.deleteConversation(userId, conversationId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/history")
    public ResponseEntity<List<AiChatHistoryItemDto>> getHistory(@CurrentUserId Long userId) {
        return ResponseEntity.ok(aiChatService.getHistory(userId));
    }

    @DeleteMapping("/history")
    public ResponseEntity<Void> clearHistory(@CurrentUserId Long userId) {
        aiChatService.clearHistory(userId);
        return ResponseEntity.noContent().build();
    }
}
