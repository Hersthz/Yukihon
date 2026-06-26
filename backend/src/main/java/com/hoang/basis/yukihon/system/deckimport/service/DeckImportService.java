package com.hoang.basis.yukihon.system.deckimport.service;

import com.hoang.basis.yukihon.system.deckimport.dto.ImportConfirmRequest;
import com.hoang.basis.yukihon.system.deckimport.dto.ImportPreviewResponse;
import com.hoang.basis.yukihon.system.deckimport.dto.ImportResultResponse;
import com.hoang.basis.yukihon.system.library.entity.Deck;
import com.hoang.basis.yukihon.system.library.entity.DeckItem;
import com.hoang.basis.yukihon.system.library.entity.Flashcard;
import com.hoang.basis.yukihon.system.library.repository.DeckItemRepository;
import com.hoang.basis.yukihon.system.library.repository.DeckRepository;
import com.hoang.basis.yukihon.system.library.repository.FlashcardRepository;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/** Parses delimited deck files (CSV/TSV/TXT) and creates a deck + cards from a column mapping. */
@Service
@RequiredArgsConstructor
public class DeckImportService {

    private static final int MAX_ROWS = 5000;
    private static final int SAMPLE_PREVIEW = 100;

    private final DeckRepository deckRepository;
    private final DeckItemRepository deckItemRepository;
    private final FlashcardRepository flashcardRepository;

    // ===================== PREVIEW =====================

    public ImportPreviewResponse preview(MultipartFile file, String delimiterOption) {
        String content = stripBom(readUtf8(file));
        char delim = resolveDelimiter(content, delimiterOption);
        List<List<String>> all = parse(content, delim);

        if (all.isEmpty()) {
            return ImportPreviewResponse.builder()
                    .delimiter(String.valueOf(delim))
                    .headerDetected(false)
                    .totalRows(0)
                    .columns(List.of())
                    .rows(List.of())
                    .suggestedMapping(List.of())
                    .build();
        }

        int colCount = all.stream().mapToInt(List::size).max().orElse(0);
        boolean header = looksLikeHeader(all.get(0));
        List<String> headerRow = header ? all.get(0) : null;
        List<List<String>> data = header ? all.subList(1, all.size()) : all;

        List<ImportPreviewResponse.Column> columns = new ArrayList<>();
        for (int i = 0; i < colCount; i++) {
            String head = headerRow != null && i < headerRow.size() ? headerRow.get(i) : "Cột " + (i + 1);
            String sample =
                    !data.isEmpty() && i < data.get(0).size() ? data.get(0).get(i) : "";
            columns.add(new ImportPreviewResponse.Column(head, sample));
        }

        List<List<String>> rows =
                data.size() > MAX_ROWS ? new ArrayList<>(data.subList(0, MAX_ROWS)) : new ArrayList<>(data);

        return ImportPreviewResponse.builder()
                .delimiter(String.valueOf(delim))
                .headerDetected(header)
                .totalRows(rows.size())
                .columns(columns)
                .rows(rows.size() > SAMPLE_PREVIEW ? rows.subList(0, SAMPLE_PREVIEW) : rows)
                .suggestedMapping(suggestMapping(headerRow, colCount))
                .build();
    }

    // ===================== CONFIRM =====================

    @Transactional
    public ImportResultResponse confirm(Long userId, ImportConfirmRequest req) {
        List<String> mapping = req.getMapping();
        int frontIdx = mapping.indexOf("FRONT");
        int backIdx = mapping.indexOf("BACK");
        int hintIdx = mapping.indexOf("HINT");
        int exampleIdx = mapping.indexOf("EXAMPLE");

        Deck deck = new Deck();
        deck.setUserId(userId);
        deck.setTitle(
                req.getDeckTitle() != null && !req.getDeckTitle().isBlank()
                        ? req.getDeckTitle().trim()
                        : "Bộ thẻ nhập");
        deck.setDescription(req.getDeckDescription());
        deck.setVisibility("PUBLIC".equals(req.getVisibility()) ? "PUBLIC" : "PRIVATE");
        deck.setSourceLanguage("ja");
        deck.setTargetLanguage("vi");
        deck.setTotalCards(0);
        Deck savedDeck = deckRepository.save(deck);

        int created = 0;
        int skipped = 0;
        int order = 0;
        for (List<String> row : req.getRows()) {
            String front = cell(row, frontIdx);
            if (front.isBlank()) {
                skipped++;
                continue;
            }
            String back = cell(row, backIdx);
            if (back.isBlank()) {
                back = firstNonBlank(cell(row, exampleIdx), cell(row, hintIdx), front);
            }

            Flashcard fc = new Flashcard();
            fc.setCardType("BASIC");
            fc.setItemType("GENERIC");
            fc.setFront(front.trim());
            fc.setBack(back.trim());
            fc.setHint(emptyToNull(cell(row, hintIdx)));
            fc.setExplanation(emptyToNull(cell(row, exampleIdx)));
            Flashcard savedFc = flashcardRepository.save(fc);

            DeckItem item = new DeckItem();
            item.setDeckId(savedDeck.getId());
            item.setFlashcardId(savedFc.getId());
            item.setOrderIndex(order++);
            deckItemRepository.save(item);
            created++;
        }

        savedDeck.setTotalCards(created);
        deckRepository.save(savedDeck);

        return ImportResultResponse.builder()
                .deckId(savedDeck.getId())
                .created(created)
                .skipped(skipped)
                .build();
    }

    // ===================== PARSING =====================

    private String readUtf8(MultipartFile file) {
        try {
            return new String(file.getBytes(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalArgumentException("Không đọc được file");
        }
    }

    private String stripBom(String s) {
        return s != null && s.startsWith("﻿") ? s.substring(1) : (s == null ? "" : s);
    }

    private char resolveDelimiter(String content, String option) {
        if (option != null) {
            switch (option.toUpperCase()) {
                case "COMMA":
                    return ',';
                case "TAB":
                    return '\t';
                case "SEMICOLON":
                    return ';';
                case "PIPE":
                    return '|';
                default:
                    break;
            }
        }
        String firstLine = content.lines().filter(l -> !l.isBlank()).findFirst().orElse("");
        char best = ',';
        int bestCount = -1;
        for (char c : new char[] {',', '\t', ';', '|'}) {
            int count = (int) firstLine.chars().filter(ch -> ch == c).count();
            if (count > bestCount) {
                bestCount = count;
                best = c;
            }
        }
        return best;
    }

    /** Quote-aware split, one record per non-empty line (quoted newlines not supported). */
    private List<List<String>> parse(String content, char delim) {
        List<List<String>> out = new ArrayList<>();
        for (String line : content.split("\r\n|\r|\n")) {
            if (line.isBlank()) {
                continue;
            }
            out.add(parseLine(line, delim));
        }
        return out;
    }

    private List<String> parseLine(String line, char delim) {
        List<String> fields = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (inQuotes) {
                if (c == '"') {
                    if (i + 1 < line.length() && line.charAt(i + 1) == '"') {
                        cur.append('"');
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    cur.append(c);
                }
            } else if (c == '"') {
                inQuotes = true;
            } else if (c == delim) {
                fields.add(cur.toString().trim());
                cur.setLength(0);
            } else {
                cur.append(c);
            }
        }
        fields.add(cur.toString().trim());
        return fields;
    }

    private boolean looksLikeHeader(List<String> firstRow) {
        for (String cell : firstRow) {
            if (fieldForHeader(cell) != null) {
                return true;
            }
        }
        return false;
    }

    private List<String> suggestMapping(List<String> headerRow, int colCount) {
        List<String> mapping = new ArrayList<>();
        if (headerRow != null) {
            for (int i = 0; i < colCount; i++) {
                String cell = i < headerRow.size() ? headerRow.get(i) : "";
                String field = fieldForHeader(cell);
                mapping.add(field != null ? field : "IGNORE");
            }
            if (!mapping.contains("FRONT") && colCount > 0) {
                mapping.set(0, "FRONT");
            }
            if (!mapping.contains("BACK") && colCount > 1) {
                mapping.set(1, "BACK");
            }
            return mapping;
        }
        for (int i = 0; i < colCount; i++) {
            mapping.add(
                    switch (i) {
                        case 0 -> "FRONT";
                        case 1 -> "BACK";
                        case 2 -> "HINT";
                        default -> "IGNORE";
                    });
        }
        return mapping;
    }

    private String fieldForHeader(String raw) {
        String h = raw == null ? "" : raw.trim().toLowerCase();
        if (h.isEmpty()) {
            return null;
        }
        if (matches(h, "front", "term", "word", "kanji", "từ", "mặt trước", "from")) {
            return "FRONT";
        }
        if (matches(h, "back", "meaning", "nghĩa", "định nghĩa", "mặt sau", "definition")) {
            return "BACK";
        }
        if (matches(h, "reading", "kana", "hiragana", "romaji", "cách đọc", "âm", "hint", "gợi ý")) {
            return "HINT";
        }
        if (matches(h, "example", "ví dụ", "câu", "note", "ghi chú", "explanation")) {
            return "EXAMPLE";
        }
        return null;
    }

    private boolean matches(String h, String... tokens) {
        for (String t : tokens) {
            if (h.equals(t) || h.contains(t)) {
                return true;
            }
        }
        return false;
    }

    private String cell(List<String> row, int idx) {
        return idx >= 0 && idx < row.size() && row.get(idx) != null ? row.get(idx) : "";
    }

    private String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v;
            }
        }
        return "";
    }

    private String emptyToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
