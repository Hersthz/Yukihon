package com.hoang.basis.yukihon.system.aichat.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.exception.ServiceUnavailableException;
import com.hoang.basis.yukihon.system.aichat.dto.AiChatConversationDto;
import com.hoang.basis.yukihon.system.aichat.dto.AiChatConversationUpdateRequest;
import com.hoang.basis.yukihon.system.aichat.dto.AiChatHistoryItemDto;
import com.hoang.basis.yukihon.system.aichat.dto.AiChatMessageRequest;
import com.hoang.basis.yukihon.system.aichat.dto.AiChatRequest;
import com.hoang.basis.yukihon.system.aichat.dto.AiChatResponse;
import com.hoang.basis.yukihon.system.aichat.entity.AiChatConversation;
import com.hoang.basis.yukihon.system.aichat.entity.AiChatMessage;
import com.hoang.basis.yukihon.system.aichat.repository.AiChatConversationRepository;
import com.hoang.basis.yukihon.system.aichat.repository.AiChatMessageRepository;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiChatService {

    private static final int MAX_MESSAGES = 12;
    private static final int MAX_MESSAGE_LENGTH = 4_000;
    private static final int MAX_TITLE_LENGTH = 120;
    private static final List<String> SUPPORTED_MODES = List.of("coach", "grammar", "conversation");
    private static final List<String> SUPPORTED_ROLES = List.of("user", "assistant");
    private static final String DEFAULT_CONVERSATION_TITLE = "New chat";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final AiChatConversationRepository aiChatConversationRepository;
    private final AiChatMessageRepository aiChatMessageRepository;
    private final UserRepository userRepository;

    @Value("${openai.api-key:}")
    private String openAiApiKey;

    @Value("${openai.model:gpt-5-mini}")
    private String openAiModel;

    @Value("${openai.base-url:https://api.openai.com/v1}")
    private String openAiBaseUrl;

    @Transactional
    public AiChatResponse respond(Long userId, AiChatRequest request) {
        validateRequest(request);

        if (openAiApiKey == null || openAiApiKey.isBlank()) {
            throw new ServiceUnavailableException(
                    "AI chat is not configured yet. Add OPENAI_API_KEY on the backend server.");
        }

        User user = findUserByIdOrThrow(userId);
        String normalizedMode = request.getMode().trim().toLowerCase(Locale.ROOT);
        AiChatMessageRequest latestUserMessage =
                request.getMessages().get(request.getMessages().size() - 1);
        AiChatConversation conversation =
                resolveConversation(user, request.getConversationId(), latestUserMessage.getText());
        Map<String, Object> body = buildOpenAiBody(request, normalizedMode, false);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(openAiApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    normalizeBaseUrl(openAiBaseUrl) + "/responses",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    String.class);

            String reply = extractReply(response.getBody());
            persistExchange(
                    user,
                    conversation,
                    normalizedMode,
                    latestUserMessage.getText().trim(),
                    reply);
            log.info("AI chat response created for userId={} mode={} model={}", userId, normalizedMode, openAiModel);

            return AiChatResponse.builder()
                    .reply(reply)
                    .model(openAiModel)
                    .mode(normalizedMode)
                    .conversationId(conversation.getId())
                    .conversationTitle(conversation.getTitle())
                    .build();
        } catch (HttpStatusCodeException exception) {
            String providerMessage = extractProviderError(exception.getResponseBodyAsString());
            log.warn(
                    "OpenAI request failed for userId={} status={} message={}",
                    userId,
                    exception.getStatusCode(),
                    providerMessage);
            throw new ServiceUnavailableException(providerMessage, exception);
        } catch (ServiceUnavailableException exception) {
            throw exception;
        } catch (Exception exception) {
            log.error("Unexpected AI chat error for userId={}", userId, exception);
            throw new ServiceUnavailableException(
                    "AI chat is temporarily unavailable. Please try again in a moment.", exception);
        }
    }

    public StreamingResponseBody streamRespond(Long userId, AiChatRequest request) {
        validateRequest(request);

        if (openAiApiKey == null || openAiApiKey.isBlank()) {
            throw new ServiceUnavailableException(
                    "AI chat is not configured yet. Add OPENAI_API_KEY on the backend server.");
        }

        User user = findUserByIdOrThrow(userId);
        String normalizedMode = request.getMode().trim().toLowerCase(Locale.ROOT);
        AiChatMessageRequest latestUserMessage =
                request.getMessages().get(request.getMessages().size() - 1);
        AiChatConversation conversation =
                resolveConversation(user, request.getConversationId(), latestUserMessage.getText());
        Map<String, Object> body = buildOpenAiBody(request, normalizedMode, true);

        return outputStream -> {
            Writer writer = new OutputStreamWriter(outputStream, StandardCharsets.UTF_8);
            writeSseEvent(
                    writer,
                    "meta",
                    objectMapper.writeValueAsString(Map.of(
                            "model",
                            openAiModel,
                            "mode",
                            normalizedMode,
                            "conversationId",
                            conversation.getId(),
                            "conversationTitle",
                            conversation.getTitle())));

            StringBuilder assistantReply = new StringBuilder();

            try {
                restTemplate.execute(
                        normalizeBaseUrl(openAiBaseUrl) + "/responses",
                        HttpMethod.POST,
                        requestCallback -> {
                            requestCallback.getHeaders().setBearerAuth(openAiApiKey);
                            requestCallback.getHeaders().setContentType(MediaType.APPLICATION_JSON);
                            requestCallback.getHeaders().setAccept(List.of(MediaType.TEXT_EVENT_STREAM));
                            objectMapper.writeValue(requestCallback.getBody(), body);
                        },
                        clientHttpResponse -> {
                            try (BufferedReader reader = new BufferedReader(
                                    new InputStreamReader(clientHttpResponse.getBody(), StandardCharsets.UTF_8))) {
                                String line;
                                while ((line = reader.readLine()) != null) {
                                    if (!line.startsWith("data: ")) {
                                        continue;
                                    }

                                    String payload = line.substring(6).trim();
                                    if (payload.isBlank() || "[DONE]".equals(payload)) {
                                        continue;
                                    }

                                    JsonNode event = objectMapper.readTree(payload);
                                    String type = event.path("type").asText("");

                                    if ("response.output_text.delta".equals(type)) {
                                        String delta = event.path("delta").asText("");
                                        if (!delta.isBlank()) {
                                            assistantReply.append(delta);
                                            writeSseEvent(
                                                    writer,
                                                    "delta",
                                                    objectMapper.writeValueAsString(Map.of("delta", delta)));
                                        }
                                        continue;
                                    }

                                    if ("response.completed".equals(type)) {
                                        // Persistence happens in finally so a partial reply is still saved
                                        // if the client aborts the stream mid-response.
                                        writeSseEvent(
                                                writer,
                                                "done",
                                                objectMapper.writeValueAsString(Map.of(
                                                        "model",
                                                        openAiModel,
                                                        "mode",
                                                        normalizedMode,
                                                        "conversationId",
                                                        conversation.getId(),
                                                        "conversationTitle",
                                                        conversation.getTitle())));
                                        break;
                                    }

                                    if ("error".equals(type)) {
                                        String message = event.path("message")
                                                .asText(
                                                        "AI provider is unavailable right now. Please try again later.");
                                        writeSseEvent(
                                                writer,
                                                "error",
                                                objectMapper.writeValueAsString(Map.of("message", message)));
                                        break;
                                    }
                                }
                            }
                            return null;
                        });
            } catch (HttpStatusCodeException exception) {
                String providerMessage = extractProviderError(exception.getResponseBodyAsString());
                writeSseEvent(writer, "error", objectMapper.writeValueAsString(Map.of("message", providerMessage)));
            } catch (Exception exception) {
                log.error("Unexpected AI chat streaming error for userId={}", userId, exception);
                writeSseEvent(
                        writer,
                        "error",
                        objectMapper.writeValueAsString(Map.of(
                                "message", "AI chat is temporarily unavailable. Please try again in a moment.")));
            } finally {
                if (assistantReply.length() > 0) {
                    try {
                        persistExchange(
                                user,
                                conversation,
                                normalizedMode,
                                latestUserMessage.getText().trim(),
                                assistantReply.toString());
                    } catch (Exception persistError) {
                        log.warn("Failed to persist AI chat exchange for userId={}", userId, persistError);
                    }
                }
                try {
                    writer.flush();
                } catch (Exception ignored) {
                    // client likely disconnected; nothing to flush
                }
            }
        };
    }

    private void validateRequest(AiChatRequest request) {
        String mode = request.getMode() == null ? "" : request.getMode().trim().toLowerCase(Locale.ROOT);
        if (!SUPPORTED_MODES.contains(mode)) {
            throw new IllegalArgumentException("Unsupported AI chat mode: " + request.getMode());
        }
        if (request.getMessages().size() > MAX_MESSAGES) {
            throw new IllegalArgumentException("Too many chat messages. Maximum is " + MAX_MESSAGES);
        }
        String lastRole =
                request.getMessages().get(request.getMessages().size() - 1).getRole();
        if (!"user".equalsIgnoreCase(lastRole)) {
            throw new IllegalArgumentException("The latest chat message must come from the user");
        }

        for (AiChatMessageRequest message : request.getMessages()) {
            String role =
                    message.getRole() == null ? "" : message.getRole().trim().toLowerCase(Locale.ROOT);
            if (!SUPPORTED_ROLES.contains(role)) {
                throw new IllegalArgumentException("Unsupported message role: " + message.getRole());
            }
            if (message.getText().trim().length() > MAX_MESSAGE_LENGTH) {
                throw new IllegalArgumentException(
                        "A chat message exceeds the maximum length of " + MAX_MESSAGE_LENGTH + " characters");
            }
        }
    }

    private Map<String, Object> toOpenAiMessage(AiChatMessageRequest message) {
        return Map.of(
                "role", message.getRole().trim().toLowerCase(Locale.ROOT),
                "content", message.getText().trim());
    }

    private Map<String, Object> buildOpenAiBody(AiChatRequest request, String normalizedMode, boolean stream) {
        List<Map<String, Object>> inputMessages = request.getMessages().stream()
                .skip(Math.max(0, request.getMessages().size() - MAX_MESSAGES))
                .map(this::toOpenAiMessage)
                .toList();

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", openAiModel);
        body.put("instructions", buildInstructions(normalizedMode));
        body.put("input", inputMessages);
        if (stream) {
            body.put("stream", true);
        }
        return body;
    }

    public List<AiChatConversationDto> getConversations(Long userId) {
        return aiChatConversationRepository.findByUserIdOrderByUpdatedAtDesc(userId).stream()
                .map(AiChatConversationDto::fromEntity)
                .toList();
    }

    @Transactional
    public AiChatConversationDto createConversation(Long userId) {
        User user = findUserByIdOrThrow(userId);
        AiChatConversation conversation = aiChatConversationRepository.save(AiChatConversation.builder()
                .user(user)
                .title(DEFAULT_CONVERSATION_TITLE)
                .build());
        return AiChatConversationDto.fromEntity(conversation);
    }

    public List<AiChatHistoryItemDto> getConversationMessages(Long userId, Long conversationId) {
        ensureConversationOwnedByUser(userId, conversationId);
        return aiChatMessageRepository.findByConversationIdAndUserIdOrderByCreatedAtAsc(conversationId, userId).stream()
                .map(AiChatHistoryItemDto::fromEntity)
                .toList();
    }

    @Transactional
    public AiChatConversationDto renameConversation(
            Long userId, Long conversationId, AiChatConversationUpdateRequest request) {
        AiChatConversation conversation = ensureConversationOwnedByUser(userId, conversationId);
        conversation.setTitle(sanitizeConversationTitle(request.getTitle()));
        conversation.setUpdatedAt(Instant.now());
        return AiChatConversationDto.fromEntity(aiChatConversationRepository.save(conversation));
    }

    @Transactional
    public void deleteConversation(Long userId, Long conversationId) {
        AiChatConversation conversation = ensureConversationOwnedByUser(userId, conversationId);
        aiChatConversationRepository.delete(conversation);
        log.info("Deleted AI chat conversation {} for userId={}", conversationId, userId);
    }

    public List<AiChatHistoryItemDto> getHistory(Long userId) {
        return aiChatMessageRepository.findByUserIdOrderByCreatedAtAsc(userId).stream()
                .map(AiChatHistoryItemDto::fromEntity)
                .toList();
    }

    @Transactional
    public void clearHistory(Long userId) {
        long deleted = aiChatConversationRepository.deleteByUserId(userId);
        log.info("Cleared {} AI chat conversations for userId={}", deleted, userId);
    }

    private String buildInstructions(String mode) {
        String baseInstruction =
                """
                You are Yukihon AI, a supportive Japanese learning assistant inside the Yukihon app.
                Reply in Vietnamese if the user writes in Vietnamese. Reply in English if the user writes in English.
                Keep answers practical, concise, and easy to study from.
                Use short sections or numbered steps when helpful.
                When explaining Japanese, include short examples and avoid making up facts.
                """;

        return switch (mode) {
            case "grammar" -> baseInstruction
                    + """
                    Focus on grammar explanation.
                    Break answers into structure, meaning, nuance, and one or two examples.
                    """;
            case "conversation" -> baseInstruction
                    + """
                    Focus on natural conversation help.
                    Draft replies that sound friendly and simple.
                    Offer a slightly more natural alternative when useful.
                    """;
            default -> baseInstruction
                    + """
                    Focus on short study coaching.
                    Prefer actionable plans, revision steps, and next actions over long theory.
                    """;
        };
    }

    private String extractReply(String body) {
        try {
            JsonNode root = objectMapper.readTree(body);

            String directOutputText = root.path("output_text").asText("");
            if (!directOutputText.isBlank()) {
                return directOutputText.trim();
            }

            JsonNode output = root.path("output");
            if (output.isArray()) {
                StringBuilder builder = new StringBuilder();
                for (JsonNode item : output) {
                    if (!"message".equals(item.path("type").asText())) {
                        continue;
                    }

                    JsonNode content = item.path("content");
                    if (!content.isArray()) {
                        continue;
                    }

                    for (JsonNode part : content) {
                        String text = part.path("text").asText("");
                        if (!text.isBlank()) {
                            if (builder.length() > 0) {
                                builder.append("\n");
                            }
                            builder.append(text.trim());
                        }
                    }
                }

                if (builder.length() > 0) {
                    return builder.toString().trim();
                }
            }
        } catch (Exception exception) {
            log.error("Failed to parse OpenAI response body", exception);
        }

        throw new ServiceUnavailableException("AI chat returned an empty response. Please try again.");
    }

    private String extractProviderError(String body) {
        if (body == null || body.isBlank()) {
            return "AI provider is unavailable right now. Please try again later.";
        }

        try {
            JsonNode root = objectMapper.readTree(body);
            String message = root.path("error").path("message").asText("");
            if (!message.isBlank()) {
                return message;
            }
        } catch (Exception exception) {
            log.debug("Could not parse provider error body", exception);
        }

        return "AI provider is unavailable right now. Please try again later.";
    }

    private String normalizeBaseUrl(String baseUrl) {
        return baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
    }

    private void persistExchange(
            User user, AiChatConversation conversation, String mode, String userText, String assistantText) {
        Instant now = Instant.now();
        conversation.setUpdatedAt(now);
        aiChatConversationRepository.save(conversation);

        aiChatMessageRepository.save(AiChatMessage.builder()
                .user(user)
                .conversation(conversation)
                .role("user")
                .text(userText)
                .mode(mode)
                .createdAt(now)
                .build());

        aiChatMessageRepository.save(AiChatMessage.builder()
                .user(user)
                .conversation(conversation)
                .role("assistant")
                .text(assistantText)
                .mode(mode)
                .model(openAiModel)
                .createdAt(now)
                .build());
    }

    private User findUserByIdOrThrow(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private AiChatConversation resolveConversation(User user, Long conversationId, String firstUserText) {
        if (conversationId == null) {
            return aiChatConversationRepository.save(AiChatConversation.builder()
                    .user(user)
                    .title(buildConversationTitle(firstUserText))
                    .build());
        }

        AiChatConversation conversation = aiChatConversationRepository
                .findByIdAndUserId(conversationId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("AI chat conversation not found"));

        if (DEFAULT_CONVERSATION_TITLE.equals(conversation.getTitle())
                && aiChatMessageRepository.countByConversationId(conversation.getId()) == 0) {
            conversation.setTitle(buildConversationTitle(firstUserText));
            conversation.setUpdatedAt(Instant.now());
            return aiChatConversationRepository.save(conversation);
        }

        return conversation;
    }

    private AiChatConversation ensureConversationOwnedByUser(Long userId, Long conversationId) {
        return aiChatConversationRepository
                .findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("AI chat conversation not found"));
    }

    private String buildConversationTitle(String sourceText) {
        String normalized = normalizeWhitespace(sourceText);
        if (normalized.isBlank()) {
            return DEFAULT_CONVERSATION_TITLE;
        }
        return truncate(normalized, 60);
    }

    private String sanitizeConversationTitle(String title) {
        String normalized = normalizeWhitespace(title);
        if (normalized.isBlank()) {
            throw new IllegalArgumentException("Conversation title must not be blank");
        }
        return truncate(normalized, MAX_TITLE_LENGTH);
    }

    private String normalizeWhitespace(String value) {
        return value == null ? "" : value.trim().replaceAll("\\s+", " ");
    }

    private String truncate(String value, int maxLength) {
        if (value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, Math.max(0, maxLength - 3)).trim() + "...";
    }

    private void writeSseEvent(Writer writer, String eventName, String data) throws IOException {
        writer.write("event: " + eventName + "\n");
        writer.write("data: " + data + "\n\n");
        writer.flush();
    }
}
