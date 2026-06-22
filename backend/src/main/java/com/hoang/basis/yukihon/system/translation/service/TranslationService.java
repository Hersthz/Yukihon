package com.hoang.basis.yukihon.system.translation.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.translation.dto.TranslateRequest;
import com.hoang.basis.yukihon.system.translation.dto.TranslateResponse;
import com.hoang.basis.yukihon.system.translation.dto.TranslationHistoryDto;
import com.hoang.basis.yukihon.system.translation.entity.TranslationHistory;
import com.hoang.basis.yukihon.system.translation.repository.TranslationHistoryRepository;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class TranslationService {

    private static final String MYMEMORY_API = "https://api.mymemory.translated.net/get";
    private static final int MAX_TEXT_LENGTH = 5000;
    private static final Set<String> SUPPORTED_LANGS = Set.of("vi", "ja", "en", "ko", "zh");
    private static final String FALLBACK_TRANSLATION = "Unable to translate. Please try again.";

    private final RestTemplate restTemplate;
    private final TranslationHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public TranslateResponse translate(Long userId, TranslateRequest request) {
        validateRequest(request);

        String sourceText = request.getText().trim();
        String sourceLang = request.getSourceLang().trim().toLowerCase();
        String targetLang = request.getTargetLang().trim().toLowerCase();

        log.info(
                "Translation request: {} -> {} | {} chars | userId={}",
                sourceLang,
                targetLang,
                sourceText.length(),
                userId);

        String translatedText = callTranslationApi(sourceText, sourceLang, targetLang);
        User user = findUserByIdOrThrow(userId);

        TranslationHistory saved = historyRepository.save(TranslationHistory.builder()
                .user(user)
                .sourceLang(sourceLang)
                .targetLang(targetLang)
                .sourceText(sourceText)
                .translatedText(translatedText)
                .bookmarked(false)
                .build());

        log.info("Translation saved: historyId={}", saved.getId());

        return TranslateResponse.builder()
                .sourceLang(sourceLang)
                .targetLang(targetLang)
                .sourceText(sourceText)
                .translatedText(translatedText)
                .historyId(saved.getId())
                .build();
    }

    public Page<TranslationHistoryDto> getHistory(Long userId, Pageable pageable) {
        return historyRepository
                .findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(TranslationHistoryDto::fromEntity);
    }

    public List<TranslationHistoryDto> getBookmarks(Long userId) {
        return historyRepository.findByUserIdAndBookmarkedTrueOrderByCreatedAtDesc(userId).stream()
                .map(TranslationHistoryDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public TranslationHistoryDto toggleBookmark(Long userId, Long historyId) {
        TranslationHistory history = findHistoryByIdAndUserIdOrThrow(historyId, userId);
        history.setBookmarked(!history.isBookmarked());

        TranslationHistory updated = historyRepository.save(history);
        log.info("Bookmark toggled: historyId={} -> bookmarked={}", historyId, updated.isBookmarked());

        return TranslationHistoryDto.fromEntity(updated);
    }

    @Transactional
    public void deleteHistoryItem(Long userId, Long historyId) {
        TranslationHistory history = findHistoryByIdAndUserIdOrThrow(historyId, userId);
        historyRepository.delete(history);
        log.info("Translation history deleted: historyId={}", historyId);
    }

    @Transactional
    public void clearAllHistory(Long userId) {
        historyRepository.deleteAllByUserId(userId);
        log.info("All translation history cleared for userId={}", userId);
    }

    public Map<String, Object> getStats(Long userId) {
        long totalTranslations = historyRepository.countByUserId(userId);
        long totalBookmarks = historyRepository.countByUserIdAndBookmarkedTrue(userId);

        return Map.of(
                "totalTranslations", totalTranslations,
                "totalBookmarks", totalBookmarks);
    }

    private String callTranslationApi(String text, String sourceLang, String targetLang) {
        try {
            String encodedText = URLEncoder.encode(text, StandardCharsets.UTF_8);
            String langPair = sourceLang + "|" + targetLang;
            String url = MYMEMORY_API + "?q=" + encodedText + "&langpair=" + langPair;

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.warn("Translation API returned non-success status for user request");
                return FALLBACK_TRANSLATION;
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode responseData = root.path("responseData");
            String translated = responseData.path("translatedText").asText("");
            if (!translated.isEmpty() && !"NO QUERY SPECIFIED".equalsIgnoreCase(translated)) {
                return translated;
            }

            JsonNode matches = root.path("matches");
            if (matches.isArray() && !matches.isEmpty()) {
                String firstMatch = matches.get(0).path("translation").asText("");
                if (!firstMatch.isBlank()) {
                    return firstMatch;
                }
            }

            log.warn("Translation API returned empty content for request");
            return FALLBACK_TRANSLATION;
        } catch (Exception exception) {
            log.error("Translation API error: {}", exception.getMessage(), exception);
            throw new RuntimeException("Translation service unavailable. Please try again later.");
        }
    }

    private void validateRequest(TranslateRequest request) {
        if (request.getText() == null || request.getText().trim().isEmpty()) {
            throw new IllegalArgumentException("Text cannot be empty");
        }
        if (request.getText().trim().length() > MAX_TEXT_LENGTH) {
            throw new IllegalArgumentException("Text exceeds maximum length of " + MAX_TEXT_LENGTH + " characters");
        }
        if (request.getSourceLang().equalsIgnoreCase(request.getTargetLang())) {
            throw new IllegalArgumentException("Source and target languages must be different");
        }
        if (!SUPPORTED_LANGS.contains(request.getSourceLang().toLowerCase())) {
            throw new IllegalArgumentException("Unsupported source language: " + request.getSourceLang());
        }
        if (!SUPPORTED_LANGS.contains(request.getTargetLang().toLowerCase())) {
            throw new IllegalArgumentException("Unsupported target language: " + request.getTargetLang());
        }
    }

    private User findUserByIdOrThrow(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private TranslationHistory findHistoryByIdAndUserIdOrThrow(Long historyId, Long userId) {
        return historyRepository
                .findByIdAndUserId(historyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Translation not found"));
    }
}
