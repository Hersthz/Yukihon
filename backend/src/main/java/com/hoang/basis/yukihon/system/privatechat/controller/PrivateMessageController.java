package com.hoang.basis.yukihon.system.privatechat.controller;

import com.hoang.basis.yukihon.base.security.CurrentUserId;
import com.hoang.basis.yukihon.system.privatechat.dto.PrivateMessageDto;
import com.hoang.basis.yukihon.system.privatechat.dto.UnreadSummaryDto;
import com.hoang.basis.yukihon.system.privatechat.service.PrivateMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/private-chat")
@RequiredArgsConstructor
public class PrivateMessageController {

    private final PrivateMessageService privateMessageService;

    @GetMapping("/history/{otherUserId}")
    public ResponseEntity<Page<PrivateMessageDto>> getHistory(
            @PathVariable Long otherUserId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @CurrentUserId Long currentUserId) {
        // The repository query already orders by createdAt DESC; passing a Sort here would emit a
        // duplicate ORDER BY column and SQL Server rejects it (error 169).
        return ResponseEntity.ok(
                privateMessageService.getConversation(currentUserId, otherUserId, PageRequest.of(page, size)));
    }

    /** Mark all messages from the other user as read. */
    @PostMapping("/read/{otherUserId}")
    public ResponseEntity<Void> markRead(@PathVariable Long otherUserId, @CurrentUserId Long currentUserId) {
        privateMessageService.markConversationRead(currentUserId, otherUserId);
        return ResponseEntity.noContent().build();
    }

    /** Unread summary: total + per-sender counts for conversation badges. */
    @GetMapping("/unread")
    public ResponseEntity<UnreadSummaryDto> unread(@CurrentUserId Long currentUserId) {
        return ResponseEntity.ok(privateMessageService.getUnreadSummary(currentUserId));
    }
}
