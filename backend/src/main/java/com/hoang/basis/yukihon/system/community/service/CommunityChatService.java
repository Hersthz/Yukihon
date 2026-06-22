package com.hoang.basis.yukihon.system.community.service;

import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.community.dto.CommunityChatMessageDto;
import com.hoang.basis.yukihon.system.community.dto.CommunityChatPresenceDto;
import com.hoang.basis.yukihon.system.community.dto.CommunityChatRoomDto;
import com.hoang.basis.yukihon.system.community.dto.CommunityChatSendRequest;
import com.hoang.basis.yukihon.system.community.dto.CommunityChatTypingEventDto;
import com.hoang.basis.yukihon.system.community.dto.CommunityChatTypingRequest;
import com.hoang.basis.yukihon.system.community.entity.CommunityChatMessage;
import com.hoang.basis.yukihon.system.community.exception.CommunityChatSocketException;
import com.hoang.basis.yukihon.system.community.repository.CommunityChatMessageRepository;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private static final Map<String, CommunityChatRoomDto> SUPPORTED_ROOMS = createSupportedRooms();

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

    public List<CommunityChatRoomDto> getAvailableRooms() {
        return List.copyOf(SUPPORTED_ROOMS.values());
    }

    public List<CommunityChatMessageDto> getRecentMessages(String roomId, Integer limit) {
        String normalizedRoomId = normalizeSupportedRoomId(roomId);
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
        String clientMessageId = normalizeClientMessageId(request.getClientMessageId());
        String normalizedRoomId = normalizeSocketRoomId(request.getRoomId(), clientMessageId);
        String normalizedContent = normalizeContent(request.getContent(), clientMessageId);

        User user =
                userRepository.findByEmail(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        assertWithinRateLimit(user.getId(), clientMessageId);

        CommunityChatMessage savedMessage = chatMessageRepository.save(CommunityChatMessage.builder()
                .roomId(normalizedRoomId)
                .user(user)
                .content(normalizedContent)
                .build());

        return CommunityChatMessageDto.fromEntity(savedMessage, clientMessageId);
    }

    public CommunityChatTypingEventDto createTypingEvent(String username, CommunityChatTypingRequest request) {
        String normalizedRoomId = normalizeSocketRoomId(request.getRoomId(), null);

        User user =
                userRepository.findByEmail(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return CommunityChatTypingEventDto.builder()
                .roomId(normalizedRoomId)
                .userId(user.getId())
                .userDisplayName(user.getDisplayName())
                .typing(request.isTyping())
                .createdAt(Instant.now())
                .build();
    }

    public CommunityChatPresenceDto createPresenceSnapshot(String roomId, Map<String, String> sessionDisplayNames) {
        LinkedHashSet<String> displayNames = new LinkedHashSet<>(sessionDisplayNames.values());

        return CommunityChatPresenceDto.builder()
                .roomId(normalizeSupportedRoomId(roomId))
                .activeUsers(displayNames.size())
                .activeDisplayNames(displayNames.stream().limit(5).toList())
                .createdAt(Instant.now())
                .build();
    }

    public String normalizeSupportedRoomId(String roomId) {
        if (roomId == null || roomId.isBlank()) {
            return DEFAULT_ROOM_ID;
        }

        String normalized = roomId.trim().toLowerCase(Locale.ROOT);
        if (!ROOM_ID_PATTERN.matcher(normalized).matches()) {
            throw new IllegalArgumentException("Invalid room id format");
        }

        if (!SUPPORTED_ROOMS.containsKey(normalized)) {
            throw new IllegalArgumentException("Unsupported room id: " + normalized);
        }

        return normalized;
    }

    private String normalizeSocketRoomId(String roomId, String clientMessageId) {
        try {
            return normalizeSupportedRoomId(roomId);
        } catch (IllegalArgumentException exception) {
            throw new CommunityChatSocketException("VALIDATION", exception.getMessage(), clientMessageId);
        }
    }

    private int normalizeLimit(Integer limit) {
        if (limit == null || limit < 1) {
            return DEFAULT_HISTORY_LIMIT;
        }
        return Math.min(limit, MAX_HISTORY_LIMIT);
    }

    private String normalizeClientMessageId(String clientMessageId) {
        if (clientMessageId == null || clientMessageId.isBlank()) {
            return null;
        }

        String normalized = clientMessageId.trim();
        return normalized.length() > 80 ? normalized.substring(0, 80) : normalized;
    }

    private String normalizeContent(String content, String clientMessageId) {
        if (content == null) {
            throw new CommunityChatSocketException("VALIDATION", "Chat message cannot be empty", clientMessageId);
        }

        String normalized = content.trim();
        if (normalized.isEmpty()) {
            throw new CommunityChatSocketException("VALIDATION", "Chat message cannot be empty", clientMessageId);
        }

        if (normalized.length() > 1000) {
            throw new CommunityChatSocketException("VALIDATION", "Chat message is too long", clientMessageId);
        }

        String lowercase = normalized.toLowerCase(Locale.ROOT);
        for (String blockedKeyword : blockedKeywords) {
            if (lowercase.contains(blockedKeyword)) {
                throw new CommunityChatSocketException(
                        "MODERATION", "Message contains blocked keyword", clientMessageId);
            }
        }

        return normalized;
    }

    private void assertWithinRateLimit(Long userId, String clientMessageId) {
        long now = System.currentTimeMillis();
        ArrayDeque<Long> window = userMessageWindows.computeIfAbsent(userId, key -> new ArrayDeque<>());

        synchronized (window) {
            while (!window.isEmpty() && now - window.peekFirst() > RATE_LIMIT_WINDOW_MS) {
                window.removeFirst();
            }

            if (window.size() >= RATE_LIMIT_MAX_MESSAGES) {
                throw new CommunityChatSocketException("RATE_LIMIT", "Chat rate limit exceeded", clientMessageId);
            }

            window.addLast(now);
        }
    }

    private static Map<String, CommunityChatRoomDto> createSupportedRooms() {
        Map<String, CommunityChatRoomDto> rooms = new LinkedHashMap<>();
        registerRoom(
                rooms, "general", "General", "Phong tro chuyen tong hop cho moi nguoi hoc.", "Open discussion", "sky");
        registerRoom(
                rooms, "n5", "N5", "Phong lam quen voi ngu phap va tu vung nen tang.", "Starter practice", "emerald");
        registerRoom(
                rooms,
                "n4",
                "N4",
                "Phong de tang toc voi mau cau va bai tap trung cap co ban.",
                "Level-up drills",
                "amber");
        registerRoom(
                rooms,
                "kanji",
                "Kanji",
                "Phong danh rieng cho bo thu, onyomi, kunyomi va ghi nho mat chu.",
                "Character lab",
                "violet");
        registerRoom(
                rooms,
                "grammar",
                "Grammar",
                "Phong thao luan mau cau, cach dung va cac diem de nham.",
                "Pattern clinic",
                "rose");
        registerRoom(
                rooms,
                "speaking",
                "Speaking",
                "Phong luyen hoi thoai, shadowing va cac tinh huong giao tiep.",
                "Conversation club",
                "cyan");
        return Collections.unmodifiableMap(rooms);
    }

    private static void registerRoom(
            Map<String, CommunityChatRoomDto> rooms,
            String id,
            String title,
            String description,
            String focus,
            String accent) {
        rooms.put(
                id,
                CommunityChatRoomDto.builder()
                        .id(id)
                        .title(title)
                        .description(description)
                        .focus(focus)
                        .accent(accent)
                        .build());
    }
}
