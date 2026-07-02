package com.hoang.basis.yukihon.system.dictionary.service;

import com.atilika.kuromoji.ipadic.Token;
import com.atilika.kuromoji.ipadic.Tokenizer;
import com.hoang.basis.yukihon.system.dictionary.dto.FuriganaToken;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Annotates Japanese text with furigana using the kuromoji (IPADIC) morphological analyzer. Each
 * token's katakana reading is converted to hiragana and aligned to its surface form, so ruby is
 * placed only over the kanji part (leading/trailing okurigana kept plain).
 */
@Service
public class FuriganaService {

    private final Tokenizer tokenizer = new Tokenizer();

    public List<List<FuriganaToken>> annotateAll(List<String> texts) {
        if (texts == null) {
            return List.of();
        }
        return texts.stream().map(this::annotate).toList();
    }

    public List<FuriganaToken> annotate(String text) {
        List<FuriganaToken> out = new ArrayList<>();
        if (text == null || text.isBlank()) {
            return out;
        }
        for (Token token : tokenizer.tokenize(text)) {
            String surface = token.getSurface();
            if (!hasKanji(surface)) {
                out.add(new FuriganaToken(surface, null));
                continue;
            }
            String reading = token.getReading();
            if (reading == null || reading.equals("*")) {
                out.add(new FuriganaToken(surface, null));
                continue;
            }
            align(surface, kataToHira(reading), out);
        }
        return out;
    }

    /** Strip kana shared with the reading at both ends, leaving ruby only over the kanji core. */
    private void align(String surface, String reading, List<FuriganaToken> out) {
        int n = surface.length();
        int m = reading.length();
        int prefix = 0;
        while (prefix < n
                && prefix < m
                && isKana(surface.charAt(prefix))
                && surface.charAt(prefix) == reading.charAt(prefix)) {
            prefix++;
        }
        int suffix = 0;
        while (suffix < n - prefix
                && suffix < m - prefix
                && isKana(surface.charAt(n - 1 - suffix))
                && surface.charAt(n - 1 - suffix) == reading.charAt(m - 1 - suffix)) {
            suffix++;
        }
        String head = surface.substring(0, prefix);
        String core = surface.substring(prefix, n - suffix);
        String tail = surface.substring(n - suffix, n);
        String coreReading = reading.substring(prefix, m - suffix);

        if (!head.isEmpty()) {
            out.add(new FuriganaToken(head, null));
        }
        if (!core.isEmpty()) {
            boolean annotate = hasKanji(core) && !coreReading.isEmpty() && !coreReading.equals(core);
            out.add(new FuriganaToken(core, annotate ? coreReading : null));
        }
        if (!tail.isEmpty()) {
            out.add(new FuriganaToken(tail, null));
        }
    }

    private String kataToHira(String katakana) {
        StringBuilder sb = new StringBuilder(katakana.length());
        for (int i = 0; i < katakana.length(); i++) {
            char c = katakana.charAt(i);
            sb.append(c >= 0x30A1 && c <= 0x30F6 ? (char) (c - 0x60) : c);
        }
        return sb.toString();
    }

    private boolean isKana(char c) {
        return (c >= 0x3040 && c <= 0x309F) || (c >= 0x30A0 && c <= 0x30FF);
    }

    private boolean hasKanji(String s) {
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if ((c >= 0x3400 && c <= 0x9FFF) || c == 0x3005) {
                return true;
            }
        }
        return false;
    }
}
