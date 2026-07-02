package com.hoang.basis.yukihon.system.dictionary.service;

import java.util.List;
import org.springframework.stereotype.Component;

/** Parses KRADFILE lines of the form {@code 明 : 日 月} (kanji : space-separated radicals). */
@Component
public class KradfileParser {

    /** One parsed KRADFILE line, or null for comments/blank/malformed lines. */
    public record Parsed(String kanji, List<String> radicals) {}

    public Parsed parseLine(String line) {
        if (line == null) {
            return null;
        }
        String trimmed = line.trim();
        if (trimmed.isEmpty() || trimmed.startsWith("#")) {
            return null;
        }
        int colon = trimmed.indexOf(':');
        if (colon < 0) {
            return null;
        }
        String kanji = trimmed.substring(0, colon).trim();
        String rest = trimmed.substring(colon + 1).trim();
        if (kanji.isEmpty() || rest.isEmpty()) {
            return null;
        }
        List<String> radicals = List.of(rest.split("\\s+"));
        return new Parsed(kanji, radicals);
    }
}
