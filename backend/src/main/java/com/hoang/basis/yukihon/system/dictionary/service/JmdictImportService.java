package com.hoang.basis.yukihon.system.dictionary.service;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoang.basis.yukihon.system.dictionary.entity.DictWord;
import com.hoang.basis.yukihon.system.dictionary.repository.DictWordRepository;
import java.io.BufferedInputStream;
import java.io.InputStream;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.zip.GZIPInputStream;
import java.util.zip.ZipInputStream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

/**
 * One-off importer for self-hosted JMdict: downloads a jmdict-simplified release (.json/.zip/.gz),
 * streams the {@code words[]} array (constant memory) and bulk-upserts into {@code dict_word}.
 * Admin-triggered, idempotent (skips when populated unless forced), runs in the background.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class JmdictImportService {

    private static final int BATCH_SIZE = 1000;
    private static final String INSERT_SQL =
            """
            INSERT INTO dict_word (jmdict_id, kanji, kana, romaji, is_common, glosses_en, part_of_speech)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE kanji=VALUES(kanji), kana=VALUES(kana), romaji=VALUES(romaji),
                is_common=VALUES(is_common), glosses_en=VALUES(glosses_en), part_of_speech=VALUES(part_of_speech)
            """;

    private final JmdictParser parser;
    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;
    private final DictWordRepository dictWordRepository;

    private final AtomicBoolean running = new AtomicBoolean(false);

    /** Kicks off the import in a background thread. Returns a status message for the admin caller. */
    public String startImport(String url, boolean force) {
        if (url == null || url.isBlank()) {
            return "No JMdict source URL configured/provided.";
        }
        if (!force && dictWordRepository.count() > 0) {
            return "dict_word already populated (" + dictWordRepository.count()
                    + " rows); pass force=true to re-import.";
        }
        if (!running.compareAndSet(false, true)) {
            return "An import is already running.";
        }
        Thread worker = new Thread(() -> runImport(url, force), "jmdict-import");
        worker.setDaemon(true);
        worker.start();
        return "JMdict import started in the background. Watch the logs for progress.";
    }

    private void runImport(String url, boolean force) {
        long started = System.nanoTime();
        int total = 0;
        try {
            if (force) {
                jdbcTemplate.execute("TRUNCATE TABLE dict_word");
                log.info("JMdict import: truncated dict_word (force)");
            }
            try (InputStream json = openJsonStream(url);
                    JsonParser p = objectMapper.getFactory().createParser(json)) {
                advanceToWordsArray(p);
                List<DictWord> batch = new ArrayList<>(BATCH_SIZE);
                while (p.nextToken() != JsonToken.END_ARRAY && p.currentToken() != null) {
                    JsonNode word = objectMapper.readTree(p);
                    DictWord dw = parser.parse(word);
                    if (dw != null) {
                        batch.add(dw);
                    }
                    if (batch.size() >= BATCH_SIZE) {
                        total += flush(batch);
                        log.info("JMdict import: {} words…", total);
                    }
                }
                total += flush(batch);
            }
            log.info("JMdict import complete: {} words in {}s", total, (System.nanoTime() - started) / 1_000_000_000);
        } catch (Exception e) {
            log.error("JMdict import failed after {} words: {}", total, e.getMessage(), e);
        } finally {
            running.set(false);
        }
    }

    /** Position the parser just before the first element of the top-level "words" array. */
    private void advanceToWordsArray(JsonParser p) throws java.io.IOException {
        while (p.nextToken() != null) {
            if (p.currentToken() == JsonToken.FIELD_NAME && "words".equals(p.currentName())) {
                p.nextToken(); // START_ARRAY
                p.nextToken(); // first element START_OBJECT (or END_ARRAY if empty)
                return;
            }
        }
        throw new IllegalStateException("No 'words' array found in JMdict JSON");
    }

    private int flush(List<DictWord> batch) {
        if (batch.isEmpty()) {
            return 0;
        }
        jdbcTemplate.batchUpdate(INSERT_SQL, batch, batch.size(), (ps, w) -> {
            ps.setString(1, w.getJmdictId());
            ps.setString(2, w.getKanji());
            ps.setString(3, w.getKana());
            ps.setString(4, w.getRomaji());
            ps.setBoolean(5, w.isCommon());
            ps.setString(6, w.getGlossesEn());
            ps.setString(7, w.getPartOfSpeech());
        });
        int n = batch.size();
        batch.clear();
        return n;
    }

    /** Open the source URL and unwrap .zip/.gz to the underlying JSON stream. */
    private InputStream openJsonStream(String url) throws Exception {
        InputStream raw = new BufferedInputStream(URI.create(url).toURL().openStream());
        String lower = url.toLowerCase();
        if (lower.endsWith(".zip")) {
            ZipInputStream zis = new ZipInputStream(raw);
            if (zis.getNextEntry() == null) {
                throw new IllegalStateException("Empty zip: " + url);
            }
            return zis;
        }
        if (lower.endsWith(".gz") || lower.endsWith(".tgz")) {
            return new GZIPInputStream(raw);
        }
        return raw;
    }
}
