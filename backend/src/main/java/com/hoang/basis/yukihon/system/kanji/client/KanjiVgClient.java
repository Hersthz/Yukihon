package com.hoang.basis.yukihon.system.kanji.client;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * Fetches KanjiVG stroke-order SVGs (cache-on-demand, server-side). File names are the zero-padded
 * 5-digit lowercase hex of the character's code point (e.g. 結 U+7D50 → {@code 07d50.svg}). Returns
 * the cleaned SVG string (from {@code <svg>} onward) or null on error.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class KanjiVgClient {

    private static final Pattern ELEMENT = Pattern.compile("kvg:element=\"([^\"]+)\"");

    private final RestTemplate restTemplate;

    @Value("${app.dictionary.kanjivg-base-url:https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@master/kanji}")
    private String baseUrl;

    /** Download the stroke-order SVG for a single character, or null if unavailable. */
    public String fetch(String character) {
        if (character == null || character.isEmpty()) {
            return null;
        }
        try {
            String code = codePointHex(character);
            String svg = restTemplate.getForObject(baseUrl + "/" + code + ".svg", String.class);
            return clean(svg);
        } catch (Exception e) {
            log.warn("KanjiVG lookup failed for '{}': {}", character, e.getMessage());
            return null;
        }
    }

    /** Zero-padded 5-digit lowercase hex of the first code point. */
    public String codePointHex(String character) {
        return String.format("%05x", character.codePointAt(0));
    }

    /** Strip the XML declaration / DOCTYPE so the SVG can be inlined into HTML. */
    public String clean(String svg) {
        if (svg == null) {
            return null;
        }
        int start = svg.indexOf("<svg");
        return start >= 0 ? svg.substring(start) : svg;
    }

    /**
     * Distinct component/radical characters declared in the SVG's {@code kvg:element} attributes,
     * excluding the character itself. Comma-joined (e.g. "吉,糸"), or null if none. Pure/testable.
     */
    public String parseComponents(String character, String svg) {
        if (svg == null || svg.isBlank()) {
            return null;
        }
        Set<String> parts = new LinkedHashSet<>();
        Matcher m = ELEMENT.matcher(svg);
        while (m.find()) {
            String el = m.group(1);
            if (el != null && !el.isBlank() && !el.equals(character)) {
                parts.add(el);
            }
        }
        return parts.isEmpty() ? null : String.join(",", parts);
    }
}
