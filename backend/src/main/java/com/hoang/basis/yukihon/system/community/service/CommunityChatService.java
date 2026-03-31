package com.hoang.basis.yukihon.system.community.service;

import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.community.dto.CommunityChatMessageDto;
import com.hoang.basis.yukihon.system.community.dto.CommunityChatSendRequest;
import com.hoang.basis.yukihon.system.community.dto.CommunityChatTypingEventDto;
import com.hoang.basis.yukihon.system.community.dto.CommunityChatTypingRequest;
import com.hoang.basis.yukihon.system.community.entity.CommunityChatMessage;
import com.hoang.basis.yukihon.system.community.repository.CommunityChatMessageRepository;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommunityChatService {

    public static final String DEFAULT_ROOM_ID = "general";
    private static final Pattern ROOM_ID_PATTERN = Pattern.compile("^[a-z0-9][a-z0-9-]{1,39}$");
    private static final int DEFAULT_HISTORY_LIMIT = 50;
    private static final int MAX_HISTORY_LIMIT = 100;
    private static final int RATE_LIMIT_MAX_MESSAGES = 8;
    private static final long RATE_LIMIT_WINDOW_MS = 10_000L;

    @Value("${app.community-chat.blocked-keywords:spam,scam,porn,sex,telegram,whatsapp}")
    private String blockedKeywordsConfig;

    private final Map<Long, ArrayDeque<Long>> userMessageWindows = new ConcurrentHashMap<>();

    private volatile List<String> blockedKeywords = List.of();

    private final CommunityChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    @PostConstruct
    void initBlockedKeywords() {
        blockedKeywords = Arrays.stream(blockedKeywordsConfig.split(","))
                .map(String::trim)
                .map(keyword -> keyword.toLowerCase(Locale.ROOT))
                .filter(keyword -> !keyword.isBlank())
                .toList();
    }

    public List<CommunityChatMessageDto> getRecentMessages(String roomId, Integer limit) {
        String normalizedRoomId = normalizeRoomId(roomId);
        int safeLimit = normalizeLimit(limit);

        return chatMessageRepository
                .findByRoomIdOrderByCreatedAtDesc(normalizedRoomId, PageRequest.of(0, safeLimit))
                .stream()
                .sorted(Comparator.comparing(CommunityChatMessage::getCreatedAt))
                .map(CommunityChatMessageDto::fromEntity)
                .toList();
    }

    @Transactional
    public CommunityChatMessageDto createMessage(String username, CommunityChatSendRequest request) {
        String normalizedRoomId = normalizeRoomId(request.getRoomId());
        String normalizedContent = normalizeContent(request.getContent());

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        assertWithinRateLimit(user.getId());

        CommunityChatMessage savedMessage = chatMessageRepository.save(
                CommunityChatMessage.builder()
                        .roomId(normalizedRoomId)
                        .user(user)
                        .content(normalizedContent)
                        .build()
        );

        return CommunityChatMessageDto.fromEntity(savedMessage);
    }

    public CommunityChatTypingEventDto createTypingEvent(String username, CommunityChatTypingRequest request) {
        String normalizedRoomId = normalizeRoomId(request.getRoomId());

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return CommunityChatTypingEventDto.builder()
                .roomId(normalizedRoomId)
                .userId(user.getId())
                .userDisplayName(user.getDisplayName())
                .typing(request.isTyping())
                .createdAt(Instant.now())
                .build();
    }

    private String normalizeRoomId(String roomId) {
        if (roomId == null || roomId.isBlank()) {
            return DEFAULT_ROOM_ID;
        }

        String normalized = roomId.trim().toLowerCase(Locale.ROOT);
        if (!ROOM_ID_PATTERN.matcher(normalized).matches()) {
            throw new IllegalArgumentException("Invalid room id format");
        }

        return normalized;
    }

    private int normalizeLimit(Integer limit) {
        if (limit == null || limit < 1) {
            return DEFAULT_HISTORY_LIMIT;
        }
        return Math.min(limit, MAX_HISTORY_LIMIT);
    }

    private String normalizeContent(String content) {
        if (content == null) {
            throw new IllegalArgumentException("Chat message cannot be empty");
        }

        String normalized = content.trim();
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("Chat message cannot be empty");
        }

        if (normalized.length() > 1000) {
            throw new IllegalArgumentException("Chat message is too long");
        }

        String lowercase = normalized.toLowerCase(Locale.ROOT);
        for (String blockedKeyword : blockedKeywords) {
            if (lowercase.contains(blockedKeyword)) {
                throw new IllegalArgumentException("Message contains blocked keyword");
            }
        }

        return normalized;
    }

    private void assertWithinRateLimit(Long userId) {
        long now = System.currentTimeMillis();
        ArrayDeque<Long> window = userMessageWindows.computeIfAbsent(userId, key -> new ArrayDeque<>());

        synchronized (window) {
            while (!window.isEmpty() && now - window.peekFirst() > RATE_LIMIT_WINDOW_MS) {
                window.removeFirst();
            }

            if (window.size() >= RATE_LIMIT_MAX_MESSAGES) {
                throw new IllegalArgumentException("Chat rate limit exceeded");
            }

            window.addLast(now);
        }
    }
}
