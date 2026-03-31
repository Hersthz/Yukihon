package com.hoang.basis.yukihon.system.community.controller;

import com.hoang.basis.yukihon.system.community.dto.CommunityChatSendRequest;
import com.hoang.basis.yukihon.system.community.service.CommunityChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

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
}
