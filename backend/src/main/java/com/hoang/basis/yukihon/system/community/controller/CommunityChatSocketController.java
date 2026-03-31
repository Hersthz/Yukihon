package com.hoang.basis.yukihon.system.community.controller;

import com.hoang.basis.yukihon.system.community.dto.CommunityChatSendRequest;
import com.hoang.basis.yukihon.system.community.dto.CommunityChatSocketErrorDto;
import com.hoang.basis.yukihon.system.community.dto.CommunityChatTypingRequest;
import com.hoang.basis.yukihon.system.community.service.CommunityChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.Instant;
import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class CommunityChatSocketController {

    private final CommunityChatService communityChatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/community-chat.send")
    public void sendMessage(@Valid @Payload CommunityChatSendRequest request, Principal principal) {
        if (principal == null) {
            throw new IllegalArgumentException("Unauthorized chat connection");
        }

        var savedMessage = communityChatService.createMessage(principal.getName(), request);
        messagingTemplate.convertAndSend("/topic/community-chat." + savedMessage.getRoomId(), savedMessage);
    }

    @MessageMapping("/community-chat.typing")
    public void typing(@Payload CommunityChatTypingRequest request, Principal principal) {
        if (principal == null) {
            throw new IllegalArgumentException("Unauthorized chat connection");
        }

        var typingEvent = communityChatService.createTypingEvent(principal.getName(), request);
        messagingTemplate.convertAndSend("/topic/community-chat.typing." + typingEvent.getRoomId(), typingEvent);
    }

    @MessageExceptionHandler(IllegalArgumentException.class)
    @SendToUser("/queue/community-chat.errors")
    public CommunityChatSocketErrorDto handleValidationError(IllegalArgumentException exception) {
        String message = exception.getMessage() == null ? "Chat action failed" : exception.getMessage();
        String normalizedMessage = message.toLowerCase();
        String code;

        if (normalizedMessage.contains("rate limit")) {
            code = "RATE_LIMIT";
        } else if (normalizedMessage.contains("blocked keyword")) {
            code = "MODERATION";
        } else if (normalizedMessage.contains("unauthorized")) {
            code = "UNAUTHORIZED";
        } else {
            code = "VALIDATION";
        }

        return CommunityChatSocketErrorDto.builder()
                .code(code)
                .message(message)
                .createdAt(Instant.now())
                .build();
    }
}
