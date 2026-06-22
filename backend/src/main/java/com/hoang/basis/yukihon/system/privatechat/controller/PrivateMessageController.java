package com.hoang.basis.yukihon.system.privatechat.controller;

import com.hoang.basis.yukihon.system.privatechat.dto.PrivateMessageDto;
import com.hoang.basis.yukihon.system.privatechat.service.PrivateMessageService;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/private-chat")
@RequiredArgsConstructor
public class PrivateMessageController {

    private final PrivateMessageService privateMessageService;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new com.hoang.basis.yukihon.exception.ResourceNotFoundException("User not found"));
        return user.getId();
    }

    @GetMapping("/history/{otherUserId}")
    public ResponseEntity<Page<PrivateMessageDto>> getHistory(
            @PathVariable Long otherUserId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long currentUserId = getUserId(userDetails);
        // The repository query already orders by createdAt DESC; passing a Sort here would emit a
        // duplicate ORDER BY column and SQL Server rejects it (error 169).
        return ResponseEntity.ok(privateMessageService.getConversation(currentUserId, otherUserId, PageRequest.of(page, size)));
    }
}