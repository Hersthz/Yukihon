package com.hoang.basis.yukihon.system.community.controller;

import com.hoang.basis.yukihon.system.community.dto.CommunityChatMessageDto;
import com.hoang.basis.yukihon.system.community.service.CommunityChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/community/chat")
@RequiredArgsConstructor
public class CommunityChatController {

    private final CommunityChatService communityChatService;

    @GetMapping("/messages")
    public ResponseEntity<List<CommunityChatMessageDto>> getRecentMessages(
            @RequestParam(required = false) String roomId,
            @RequestParam(defaultValue = "50") Integer limit
    ) {
        return ResponseEntity.ok(communityChatService.getRecentMessages(roomId, limit));
    }
}
