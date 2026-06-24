package com.hoang.basis.yukihon.system.kanji.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoang.basis.yukihon.system.kanji.entity.KanjiInfo;
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
 * Client for kanjiapi.dev (KANJIDIC data). Server-side + behind the kanji cache, so it's hit at
 * most once per character. Returns a {@link KanjiInfo} (without id/timestamp) or null on error.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class KanjiApiClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.dictionary.kanji-api-base-url:https://kanjiapi.dev/v1/kanji}")
    private String baseUrl;

    public KanjiInfo fetch(String character) {
        try {
            var uri = UriComponentsBuilder.fromUriString(baseUrl + "/{c}")
                    .build()
                    .expand(character)
                    .encode(StandardCharsets.UTF_8)
                    .toUri();
            return parse(character, restTemplate.getForObject(uri, String.class));
        } catch (Exception e) {
            log.warn("kanjiapi.dev lookup failed for '{}': {}", character, e.getMessage());
            return null;
        }
    }

    /** Pure parse of a kanjiapi.dev response — unit-testable. Returns null if no meanings. */
    public KanjiInfo parse(String character, String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            JsonNode root = objectMapper.readTree(json);
            String meaning = joinArray(root.path("meanings"), "; ", 500);
            if (meaning == null) {
                return null;
            }
            return KanjiInfo.builder()
                    .character(character)
                    .meaning(meaning)
                    .onReadings(joinArray(root.path("on_readings"), ", ", 255))
                    .kunReadings(joinArray(root.path("kun_readings"), ", ", 255))
                    .strokeCount(
                            root.path("stroke_count").isInt()
                                    ? root.path("stroke_count").asInt()
                                    : null)
                    .jlptLevel(mapJlpt(root.path("jlpt")))
                    .build();
        } catch (Exception e) {
            log.warn("Failed to parse kanjiapi.dev response: {}", e.getMessage());
            return null;
        }
    }

    private String joinArray(JsonNode arr, String sep, int max) {
        if (arr == null || !arr.isArray() || arr.isEmpty()) {
            return null;
        }
        List<String> values = new ArrayList<>();
        for (JsonNode n : arr) {
            String t = n.asText(null);
            if (t != null && !t.isBlank()) {
                values.add(t);
            }
        }
        if (values.isEmpty()) {
            return null;
        }
        String joined = String.join(sep, values);
        return joined.length() > max ? joined.substring(0, max) : joined;
    }

    /** kanjiapi.dev uses the former 4-level JLPT; map roughly to the current N-scale. */
    private String mapJlpt(JsonNode node) {
        if (!node.isInt()) {
            return null;
        }
        return switch (node.asInt()) {
            case 1 -> "N1";
            case 2 -> "N2";
            case 3 -> "N3";
            case 4 -> "N5";
            default -> null;
        };
    }
}
