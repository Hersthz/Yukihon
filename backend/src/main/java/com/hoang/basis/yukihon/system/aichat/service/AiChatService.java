package com.hoang.basis.yukihon.system.aichat.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoang.basis.yukihon.exception.ServiceUnavailableException;
import com.hoang.basis.yukihon.system.aichat.dto.AiChatMessageRequest;
import com.hoang.basis.yukihon.system.aichat.dto.AiChatRequest;
import com.hoang.basis.yukihon.system.aichat.dto.AiChatResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiChatService {

    private static final int MAX_MESSAGES = 12;
    private static final int MAX_MESSAGE_LENGTH = 4_000;
    private static final List<String> SUPPORTED_MODES = List.of("coach", "grammar", "conversation");
    private static final List<String> SUPPORTED_ROLES = List.of("user", "assistant");

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${openai.api-key:}")
    private String openAiApiKey;

    @Value("${openai.model:gpt-5-mini}")
    private String openAiModel;

    @Value("${openai.base-url:https://api.openai.com/v1}")
    private String openAiBaseUrl;

    public AiChatResponse respond(Long userId, AiChatRequest request) {
        validateRequest(request);

        if (openAiApiKey == null || openAiApiKey.isBlank()) {
            throw new ServiceUnavailableException("AI chat is not configured yet. Add OPENAI_API_KEY on the backend server.");
        }

        String normalizedMode = request.getMode().trim().toLowerCase(Locale.ROOT);
        List<Map<String, Object>> inputMessages = request.getMessages().stream()
                .skip(Math.max(0, request.getMessages().size() - MAX_MESSAGES))
                .map(this::toOpenAiMessage)
                .toList();

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", openAiModel);
        body.put("instructions", buildInstructions(normalizedMode));
        body.put("input", inputMessages);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(openAiApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    normalizeBaseUrl(openAiBaseUrl) + "/responses",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    String.class
            );

            String reply = extractReply(response.getBody());
            log.info("AI chat response created for userId={} mode={} model={}", userId, normalizedMode, openAiModel);

            return AiChatResponse.builder()
                    .reply(reply)
                    .model(openAiModel)
                    .mode(normalizedMode)
                    .build();
        } catch (HttpStatusCodeException exception) {
            String providerMessage = extractProviderError(exception.getResponseBodyAsString());
            log.warn("OpenAI request failed for userId={} status={} message={}",
                    userId,
                    exception.getStatusCode(),
                    providerMessage);
            throw new ServiceUnavailableException(providerMessage, exception);
        } catch (ServiceUnavailableException exception) {
            throw exception;
        } catch (Exception exception) {
            log.error("Unexpected AI chat error for userId={}", userId, exception);
            throw new ServiceUnavailableException("AI chat is temporarily unavailable. Please try again in a moment.", exception);
        }
    }

    private void validateRequest(AiChatRequest request) {
        String mode = request.getMode() == null ? "" : request.getMode().trim().toLowerCase(Locale.ROOT);
        if (!SUPPORTED_MODES.contains(mode)) {
            throw new IllegalArgumentException("Unsupported AI chat mode: " + request.getMode());
        }
        if (request.getMessages().size() > MAX_MESSAGES) {
            throw new IllegalArgumentException("Too many chat messages. Maximum is " + MAX_MESSAGES);
        }

        for (AiChatMessageRequest message : request.getMessages()) {
            String role = message.getRole() == null ? "" : message.getRole().trim().toLowerCase(Locale.ROOT);
            if (!SUPPORTED_ROLES.contains(role)) {
                throw new IllegalArgumentException("Unsupported message role: " + message.getRole());
            }
            if (message.getText().trim().length() > MAX_MESSAGE_LENGTH) {
                throw new IllegalArgumentException("A chat message exceeds the maximum length of " + MAX_MESSAGE_LENGTH + " characters");
            }
        }
    }

    private Map<String, Object> toOpenAiMessage(AiChatMessageRequest message) {
        return Map.of(
                "role", message.getRole().trim().toLowerCase(Locale.ROOT),
                "content", message.getText().trim()
        );
    }

    private String buildInstructions(String mode) {
        String baseInstruction = """
                You are Yukihon AI, a supportive Japanese learning assistant inside the Yukihon app.
                Reply in Vietnamese if the user writes in Vietnamese. Reply in English if the user writes in English.
                Keep answers practical, concise, and easy to study from.
                Use short sections or numbered steps when helpful.
                When explaining Japanese, include short examples and avoid making up facts.
                """;

        return switch (mode) {
            case "grammar" -> baseInstruction + """
                    Focus on grammar explanation.
                    Break answers into structure, meaning, nuance, and one or two examples.
                    """;
            case "conversation" -> baseInstruction + """
                    Focus on natural conversation help.
                    Draft replies that sound friendly and simple.
                    Offer a slightly more natural alternative when useful.
                    """;
            default -> baseInstruction + """
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
                            if (!builder.isEmpty()) {
                                builder.append("\n");
                            }
                            builder.append(text.trim());
                        }
                    }
                }

                if (!builder.isEmpty()) {
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
}
