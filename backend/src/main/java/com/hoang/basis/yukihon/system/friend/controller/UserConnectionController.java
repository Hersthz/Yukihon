package com.hoang.basis.yukihon.system.friend.controller;

import com.hoang.basis.yukihon.system.friend.dto.UserConnectionDto;
import com.hoang.basis.yukihon.system.friend.entity.ConnectionStatus;
import com.hoang.basis.yukihon.system.friend.entity.ConnectionType;
import com.hoang.basis.yukihon.system.friend.service.UserConnectionService;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/connections")
@RequiredArgsConstructor
public class UserConnectionController {

    private final UserConnectionService userConnectionService;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    @PostMapping("/request/{receiverId}")
    public ResponseEntity<UserConnectionDto> sendRequest(@PathVariable Long receiverId, @RequestParam ConnectionType type, @AuthenticationPrincipal UserDetails userDetails) {
        Long requesterId = getUserId(userDetails);
        return ResponseEntity.ok(userConnectionService.createConnection(requesterId, receiverId, type));
    }

    @PostMapping("/accept/{connectionId}")
    public ResponseEntity<UserConnectionDto> acceptRequest(@PathVariable Long connectionId, @AuthenticationPrincipal UserDetails userDetails) {
        Long receiverId = getUserId(userDetails);
        return ResponseEntity.ok(userConnectionService.acceptConnection(receiverId, connectionId));
    }

    @DeleteMapping("/{connectionId}")
    public ResponseEntity<Void> removeConnection(@PathVariable Long connectionId, @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        userConnectionService.deleteConnection(userId, connectionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/friends")
    public ResponseEntity<List<UserConnectionDto>> getFriends(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(userConnectionService.getConnections(userId, ConnectionType.FRIEND, ConnectionStatus.ACCEPTED));
    }

    @GetMapping("/following")
    public ResponseEntity<List<UserConnectionDto>> getFollowing(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(userConnectionService.getConnections(userId, ConnectionType.FOLLOW, ConnectionStatus.ACCEPTED));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<UserConnectionDto>> getPendingRequests(@RequestParam(defaultValue = "FRIEND") ConnectionType type, @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(userConnectionService.getPendingRequests(userId, type));
    }
}