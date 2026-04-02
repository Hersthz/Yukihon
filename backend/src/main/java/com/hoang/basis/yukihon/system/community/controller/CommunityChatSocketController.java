package com.hoang.basis.yukihon.system.community.controller;

import com.hoang.basis.yukihon.system.community.dto.CommunityChatSendRequest;
import com.hoang.basis.yukihon.system.community.dto.CommunityChatSocketErrorDto;
import com.hoang.basis.yukihon.system.community.dto.CommunityChatTypingRequest;
import com.hoang.basis.yukihon.system.community.exception.CommunityChatSocketException;
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
            throw new CommunityChatSocketException("UNAUTHORIZED", "Unauthorized chat connection", request.getClientMessageId());
        }

        var savedMessage = communityChatService.createMessage(principal.getName(), request);
        messagingTemplate.convertAndSend("/topic/community-chat." + savedMessage.getRoomId(), savedMessage);
    }

    @MessageMapping("/community-chat.typing")
    public void typing(@Payload CommunityChatTypingRequest request, Principal principal) {
        if (principal == null) {
            throw new CommunityChatSocketException("UNAUTHORIZED", "Unauthorized chat connection", null);
        }

        var typingEvent = communityChatService.createTypingEvent(principal.getName(), request);
        messagingTemplate.convertAndSend("/topic/community-chat.typing." + typingEvent.getRoomId(), typingEvent);
    }

    @MessageExceptionHandler(CommunityChatSocketException.class)
    @SendToUser("/queue/community-chat.errors")
    public CommunityChatSocketErrorDto handleValidationError(CommunityChatSocketException exception) {
        String message = exception.getMessage() == null ? "Chat action failed" : exception.getMessage();
        return CommunityChatSocketErrorDto.builder()
                .code(exception.getCode())
                .message(message)
                .clientMessageId(exception.getClientMessageId())
                .createdAt(Instant.now())
                .build();
    }
}
