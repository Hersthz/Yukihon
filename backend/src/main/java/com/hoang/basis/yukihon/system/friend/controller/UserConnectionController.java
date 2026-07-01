package com.hoang.basis.yukihon.system.friend.controller;

import com.hoang.basis.yukihon.base.security.CurrentUserId;
import com.hoang.basis.yukihon.system.friend.dto.UserConnectionDto;
import com.hoang.basis.yukihon.system.friend.entity.ConnectionStatus;
import com.hoang.basis.yukihon.system.friend.entity.ConnectionType;
import com.hoang.basis.yukihon.system.friend.service.UserConnectionService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/connections")
@RequiredArgsConstructor
public class UserConnectionController {

    private final UserConnectionService userConnectionService;

    @PostMapping("/request/{receiverId}")
    public ResponseEntity<UserConnectionDto> sendRequest(
            @PathVariable Long receiverId, @RequestParam ConnectionType type, @CurrentUserId Long requesterId) {
        return ResponseEntity.ok(userConnectionService.createConnection(requesterId, receiverId, type));
    }

    @PostMapping("/accept/{connectionId}")
    public ResponseEntity<UserConnectionDto> acceptRequest(
            @PathVariable Long connectionId, @CurrentUserId Long receiverId) {
        return ResponseEntity.ok(userConnectionService.acceptConnection(receiverId, connectionId));
    }

    @DeleteMapping("/{connectionId}")
    public ResponseEntity<Void> removeConnection(@PathVariable Long connectionId, @CurrentUserId Long userId) {
        userConnectionService.deleteConnection(userId, connectionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/friends")
    public ResponseEntity<List<UserConnectionDto>> getFriends(@CurrentUserId Long userId) {
        return ResponseEntity.ok(
                userConnectionService.getConnections(userId, ConnectionType.FRIEND, ConnectionStatus.ACCEPTED));
    }

    @GetMapping("/following")
    public ResponseEntity<List<UserConnectionDto>> getFollowing(@CurrentUserId Long userId) {
        return ResponseEntity.ok(
                userConnectionService.getConnections(userId, ConnectionType.FOLLOW, ConnectionStatus.ACCEPTED));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<UserConnectionDto>> getPendingRequests(
            @RequestParam(defaultValue = "FRIEND") ConnectionType type, @CurrentUserId Long userId) {
        return ResponseEntity.ok(userConnectionService.getPendingRequests(userId, type));
    }
}
