package com.hoang.basis.yukihon.system.dictionary.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.hoang.basis.yukihon.system.dictionary.entity.DictWord;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Component;

/**
 * Converts one jmdict-simplified {@code words[]} element into a {@link DictWord} (primary forms +
 * joined English glosses). Pure (no I/O) so it is unit-testable against fixtures.
 *
 * <p>Element shape: {@code {id, kanji:[{text,common}], kana:[{text,common}], sense:[{partOfSpeech:[],
 * gloss:[{lang,text}]}]}}.
 */
@Component
public class JmdictParser {

    private static final int MAX_GLOSS = 2000;
    private static final int MAX_POS = 255;

    /** Returns null for entries with no reading (kana is required). */
    public DictWord parse(JsonNode word) {
        if (word == null) {
            return null;
        }
        String jmdictId = word.path("id").asText(null);
        JsonNode kanjiArr = word.path("kanji");
        JsonNode kanaArr = word.path("kana");

        String kana = primaryForm(kanaArr);
        if (jmdictId == null || kana == null) {
            return null;
        }
        String kanji = primaryForm(kanjiArr);
        boolean common = anyCommon(kanjiArr) || anyCommon(kanaArr);

        Set<String> glosses = new LinkedHashSet<>();
        Set<String> pos = new LinkedHashSet<>();
        for (JsonNode sense : word.path("sense")) {
            for (JsonNode p : sense.path("partOfSpeech")) {
                pos.add(p.asText());
            }
            for (JsonNode g : sense.path("gloss")) {
                String lang = g.path("lang").asText("eng");
                String text = g.path("text").asText(null);
                if (text != null && !text.isBlank() && ("eng".equals(lang) || lang.isBlank())) {
                    glosses.add(text.trim());
                }
            }
        }
        if (glosses.isEmpty()) {
            return null;
        }

        return DictWord.builder()
                .jmdictId(jmdictId)
                .kanji(kanji)
                .kana(kana)
                .romaji(RomajiConverter.toRomaji(kana))
                .common(common)
                .glossesEn(truncate(String.join("; ", glosses), MAX_GLOSS))
                .partOfSpeech(pos.isEmpty() ? null : truncate(String.join(", ", pos), MAX_POS))
                .build();
    }

    /** First common form, else the first form, else null. */
    private String primaryForm(JsonNode forms) {
        if (forms == null || !forms.isArray() || forms.isEmpty()) {
            return null;
        }
        for (JsonNode f : forms) {
            if (f.path("common").asBoolean(false)) {
                return f.path("text").asText(null);
            }
        }
        return forms.get(0).path("text").asText(null);
    }

    private boolean anyCommon(JsonNode forms) {
        if (forms == null || !forms.isArray()) {
            return false;
        }
        for (JsonNode f : forms) {
            if (f.path("common").asBoolean(false)) {
                return true;
            }
        }
        return false;
    }

    private String truncate(String s, int max) {
        return s.length() <= max ? s : s.substring(0, max);
    }

    /** Convenience for callers that hold a batch of nodes. */
    public List<DictWord> parseAll(Iterable<JsonNode> words) {
        List<DictWord> out = new ArrayList<>();
        for (JsonNode w : words) {
            DictWord dw = parse(w);
            if (dw != null) {
                out.add(dw);
            }
        }
        return out;
    }
}
