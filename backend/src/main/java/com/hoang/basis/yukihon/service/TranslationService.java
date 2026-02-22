package com.hoang.basis.yukihon.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoang.basis.yukihon.dto.translation.TranslateRequest;
import com.hoang.basis.yukihon.dto.translation.TranslateResponse;
import com.hoang.basis.yukihon.dto.translation.TranslationHistoryDto;
import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.model.TranslationHistory;
import com.hoang.basis.yukihon.model.User;
import com.hoang.basis.yukihon.repository.TranslationHistoryRepository;
import com.hoang.basis.yukihon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TranslationService {

    private final RestTemplate restTemplate;
    private final TranslationHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    private static final String MYMEMORY_API = "https://api.mymemory.translated.net/get";
    private static final int MAX_TEXT_LENGTH = 5000;
    private static final Set<String> SUPPORTED_LANGS = Set.of("vi", "ja", "en", "ko", "zh");

    // ─── Translate + lưu lịch sử ─────────────────────────────────────

    @Transactional
    public TranslateResponse translate(Long userId, TranslateRequest request) {
        validateRequest(request);

        String sourceText = request.getText().trim();
        String sourceLang = request.getSourceLang().trim().toLowerCase();
        String targetLang = request.getTargetLang().trim().toLowerCase();

        log.info("Translation request: {} → {} | {} chars | userId={}",
                sourceLang, targetLang, sourceText.length(), userId);

        // Gọi API dịch
        String translatedText = callTranslationAPI(sourceText, sourceLang, targetLang);

        // Lưu lịch sử
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TranslationHistory history = TranslationHistory.builder()
                .user(user)
                .sourceLang(sourceLang)
                .targetLang(targetLang)
                .sourceText(sourceText)
                .translatedText(translatedText)
                .bookmarked(false)
                .build();
        TranslationHistory saved = historyRepository.save(history);

        log.info("Translation saved: historyId={}", saved.getId());

        return TranslateResponse.builder()
                .sourceLang(sourceLang)
                .targetLang(targetLang)
                .sourceText(sourceText)
                .translatedText(translatedText)
                .historyId(saved.getId())
                .build();
    }

    // ─── Lịch sử dịch ───────────────────────────────────────────────

    public Page<TranslationHistoryDto> getHistory(Long userId, Pageable pageable) {
        return historyRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(TranslationHistoryDto::fromEntity);
    }

    public List<TranslationHistoryDto> getBookmarks(Long userId) {
        return historyRepository.findByUserIdAndBookmarkedTrueOrderByCreatedAtDesc(userId)
                .stream()
                .map(TranslationHistoryDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public TranslationHistoryDto toggleBookmark(Long userId, Long historyId) {
        TranslationHistory history = historyRepository.findByIdAndUserId(historyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Translation not found"));
        history.setBookmarked(!history.isBookmarked());
        TranslationHistory updated = historyRepository.save(history);
        log.info("Bookmark toggled: historyId={} → bookmarked={}", historyId, updated.isBookmarked());
        return TranslationHistoryDto.fromEntity(updated);
    }

    @Transactional
    public void deleteHistoryItem(Long userId, Long historyId) {
        TranslationHistory history = historyRepository.findByIdAndUserId(historyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Translation not found"));
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
        long totalBookmarks = historyRepository
                .findByUserIdAndBookmarkedTrueOrderByCreatedAtDesc(userId).size();
        return Map.of(
                "totalTranslations", totalTranslations,
                "totalBookmarks", totalBookmarks
        );
    }

    // ─── Gọi API dịch bên ngoài ──────────────────────────────────────

    private String callTranslationAPI(String text, String sourceLang, String targetLang) {
        try {
            String encodedText = URLEncoder.encode(text, StandardCharsets.UTF_8);
            String langPair = sourceLang + "|" + targetLang;
            String url = MYMEMORY_API + "?q=" + encodedText + "&langpair=" + langPair;

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode responseData = root.path("responseData");
                String translated = responseData.path("translatedText").asText("");

                if (!translated.isEmpty() && !translated.equalsIgnoreCase("NO QUERY SPECIFIED")) {
                    return translated;
                }

                // Thử lấy từ matches nếu responseData rỗng
                JsonNode matches = root.path("matches");
                if (matches.isArray() && !matches.isEmpty()) {
                    return matches.get(0).path("translation").asText("Không thể dịch");
                }
            }

            log.warn("Translation API returned empty/error for: {}", text.substring(0, Math.min(50, text.length())));
            return "Không thể dịch. Vui lòng thử lại.";

        } catch (Exception e) {
            log.error("Translation API error: {}", e.getMessage(), e);
            throw new RuntimeException("Translation service unavailable. Please try again later.");
        }
    }

    // ─── Validation ──────────────────────────────────────────────────

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
}
