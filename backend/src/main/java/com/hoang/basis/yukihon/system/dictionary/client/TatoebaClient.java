package com.hoang.basis.yukihon.system.dictionary.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * Thin client for the Tatoeba sentence API (api.tatoeba.org/v1/sentences). Used server-side only
 * (the API has no CORS) and behind the dictionary example cache, so it's hit at most once per word.
 * Returns Japanese sentences each paired with a translation in the requested language.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TatoebaClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.dictionary.tatoeba.base-url:https://api.tatoeba.org/v1/sentences}")
    private String baseUrl;

    /** One matched Japanese sentence and its translation in the requested language. */
    public record TatoebaResult(long jpnId, String jpnText, String translation) {}

    /**
     * Fetch Japanese sentences containing {@code word} that have a translation in {@code targetLang}
     * (ISO 639-3, e.g. "vie", "eng"). Returns an empty list on any error (graceful degradation).
     */
    public List<TatoebaResult> search(String word, String targetLang, int limit) {
        try {
            var uri = UriComponentsBuilder.fromUriString(baseUrl)
                    .queryParam("lang", "jpn")
                    .queryParam("q", word)
                    .queryParam("trans:lang", targetLang)
                    .queryParam("sort", "relevance")
                    .queryParam("limit", limit)
                    .build()
                    .encode(StandardCharsets.UTF_8)
                    .toUri();
            String json = restTemplate.getForObject(uri, String.class);
            return parse(json, targetLang);
        } catch (Exception e) {
            log.warn("Tatoeba lookup failed for '{}' ({}): {}", word, targetLang, e.getMessage());
            return List.of();
        }
    }

    /**
     * Parse a Tatoeba {@code /v1/sentences} JSON response, extracting each Japanese sentence and its
     * first translation in {@code targetLang}. Pure (no I/O) so it is unit-testable with fixtures.
     */
    public List<TatoebaResult> parse(String json, String targetLang) {
        List<TatoebaResult> results = new ArrayList<>();
        if (json == null || json.isBlank()) {
            return results;
        }
        try {
            JsonNode data = objectMapper.readTree(json).path("data");
            for (JsonNode sentence : data) {
                String jpnText = sentence.path("text").asText(null);
                long jpnId = sentence.path("id").asLong(0);
                if (jpnText == null || jpnText.isBlank()) {
                    continue;
                }
                String translation = firstTranslation(sentence.path("translations"), targetLang);
                if (translation != null) {
                    results.add(new TatoebaResult(jpnId, jpnText, translation));
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse Tatoeba response: {}", e.getMessage());
        }
        return results;
    }

    private String firstTranslation(JsonNode translations, String targetLang) {
        if (translations == null || !translations.isArray()) {
            return null;
        }
        for (JsonNode t : translations) {
            if (targetLang.equals(t.path("lang").asText())) {
                String text = t.path("text").asText(null);
                if (text != null && !text.isBlank()) {
                    return text;
                }
            }
        }
        return null;
    }
}
