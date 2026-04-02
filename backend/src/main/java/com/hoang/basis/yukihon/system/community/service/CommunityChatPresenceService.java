package com.hoang.basis.yukihon.system.community.service;

import com.hoang.basis.yukihon.system.community.dto.CommunityChatPresenceDto;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.security.Principal;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class CommunityChatPresenceService {

    private static final String CHAT_TOPIC_PREFIX = "/topic/community-chat.";

    private final SimpMessagingTemplate messagingTemplate;
    private final CommunityChatService communityChatService;
    private final UserRepository userRepository;

    private final Map<String, Set<String>> roomSessions = new ConcurrentHashMap<>();
    private final Map<String, Map<String, String>> roomDisplayNames = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> sessionRooms = new ConcurrentHashMap<>();
    private final Map<String, String> sessionDisplayNames = new ConcurrentHashMap<>();

    @EventListener
    public void handleSubscription(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(event.getMessage(), StompHeaderAccessor.class);
        if (accessor == null || !StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            return;
        }

        String destination = accessor.getDestination();
        String sessionId = accessor.getSessionId();
        Principal principal = accessor.getUser();

        if (destination == null || sessionId == null || principal == null || !destination.startsWith(CHAT_TOPIC_PREFIX)) {
            return;
        }

        if (destination.contains(".typing.") || destination.contains(".presence.")) {
            return;
        }

        String rawRoomId = destination.substring(CHAT_TOPIC_PREFIX.length());
        if (rawRoomId.isBlank()) {
            return;
        }

        String roomId;
        try {
            roomId = communityChatService.normalizeSupportedRoomId(rawRoomId);
        } catch (IllegalArgumentException exception) {
            return;
        }

        String displayName = sessionDisplayNames.computeIfAbsent(sessionId, key -> resolveDisplayName(principal.getName()));

        roomSessions.computeIfAbsent(roomId, key -> ConcurrentHashMap.newKeySet()).add(sessionId);
        roomDisplayNames.computeIfAbsent(roomId, key -> new ConcurrentHashMap<>()).put(sessionId, displayName);
        sessionRooms.computeIfAbsent(sessionId, key -> ConcurrentHashMap.newKeySet()).add(roomId);

        broadcastPresence(roomId);
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        if (sessionId == null) {
            return;
        }

        Set<String> subscribedRooms = sessionRooms.remove(sessionId);
        sessionDisplayNames.remove(sessionId);

        if (subscribedRooms == null || subscribedRooms.isEmpty()) {
            return;
        }

        subscribedRooms.forEach(roomId -> {
            Set<String> sessions = roomSessions.get(roomId);
            if (sessions != null) {
                sessions.remove(sessionId);
                if (sessions.isEmpty()) {
                    roomSessions.remove(roomId);
                }
            }

            Map<String, String> displayNames = roomDisplayNames.get(roomId);
            if (displayNames != null) {
                displayNames.remove(sessionId);
                if (displayNames.isEmpty()) {
                    roomDisplayNames.remove(roomId);
                }
            }

            broadcastPresence(roomId);
        });
    }

    private void broadcastPresence(String roomId) {
        Map<String, String> displayNames = roomDisplayNames.get(roomId);
        CommunityChatPresenceDto snapshot = communityChatService.createPresenceSnapshot(
                roomId,
                displayNames == null ? Map.of() : displayNames
        );
        messagingTemplate.convertAndSend("/topic/community-chat.presence." + roomId, snapshot);
    }

    private String resolveDisplayName(String username) {
        return userRepository.findByEmail(username)
                .map(User::getDisplayName)
                .orElse(username);
    }
}
