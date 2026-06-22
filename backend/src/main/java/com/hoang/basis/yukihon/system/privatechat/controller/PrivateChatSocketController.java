package com.hoang.basis.yukihon.system.privatechat.controller;

import com.hoang.basis.yukihon.system.privatechat.dto.PrivateMessageDto;
import com.hoang.basis.yukihon.system.privatechat.service.PrivateMessageService;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import java.security.Principal;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class PrivateChatSocketController {

    private final PrivateMessageService privateMessageService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/private-chat.send")
    public void sendMessage(
            @Payload PrivateChatMessagePayload payload, Principal principal, SimpMessageHeaderAccessor headerAccessor) {
        if (principal == null) {
            return;
        }

        User sender = userRepository.findByEmail(principal.getName()).orElse(null);
        if (sender == null) return;

        Long senderId = sender.getId();
        Long receiverId = payload.getReceiverId();

        PrivateMessageDto savedMessage = privateMessageService.saveMessage(senderId, receiverId, payload.getContent());

        // We use email as the principal name for convertAndSendToUser
        User receiver = userRepository.findById(receiverId).orElse(null);
        if (receiver != null) {
            messagingTemplate.convertAndSendToUser(receiver.getEmail(), "/queue/private", savedMessage);
        }

        messagingTemplate.convertAndSendToUser(sender.getEmail(), "/queue/private", savedMessage);
    }

    @MessageMapping("/private-chat.typing")
    public void typingIndicator(@Payload PrivateChatTypingPayload payload, Principal principal) {
        if (principal == null) {
            return;
        }

        User sender = userRepository.findByEmail(principal.getName()).orElse(null);
        if (sender == null) return;

        User receiver = userRepository.findById(payload.getReceiverId()).orElse(null);
        if (receiver != null) {
            messagingTemplate.convertAndSendToUser(
                    receiver.getEmail(),
                    "/queue/private-typing",
                    new PrivateChatTypingResponse(sender.getId(), payload.isTyping()));
        }
    }

    @Data
    public static class PrivateChatMessagePayload {
        private Long receiverId;
        private String content;
    }

    @Data
    public static class PrivateChatTypingPayload {
        private Long receiverId;
        private boolean typing;
    }

    @Data
    public static class PrivateChatTypingResponse {
        private final Long senderId;
        private final boolean typing;
    }
}
