package com.hoang.basis.yukihon.system.dictionary.service;

import com.hoang.basis.yukihon.system.dictionary.repository.KanjiRadicalRepository;
import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.zip.GZIPInputStream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

/**
 * One-off importer for the KRADFILE radical→kanji index (UTF-8 text, optionally .gz). Admin-triggered,
 * idempotent (skips when populated unless forced), runs in the background. Each line
 * {@code 明 : 日 月} expands to (radical, kanji) rows.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class KradfileImportService {

    private static final int BATCH_SIZE = 2000;
    private static final String INSERT_SQL =
            """
            INSERT INTO kanji_radical (radical, kanji) VALUES (?, ?)
            ON DUPLICATE KEY UPDATE radical = VALUES(radical)
            """;

    private final KradfileParser parser;
    private final JdbcTemplate jdbcTemplate;
    private final KanjiRadicalRepository repository;

    private final AtomicBoolean running = new AtomicBoolean(false);

    public String startImport(String url, boolean force) {
        if (url == null || url.isBlank()) {
            return "No KRADFILE source URL configured/provided.";
        }
        if (!force && repository.count() > 0) {
            return "kanji_radical already populated (" + repository.count() + " rows); pass force=true to re-import.";
        }
        if (!running.compareAndSet(false, true)) {
            return "An import is already running.";
        }
        Thread worker = new Thread(() -> runImport(url, force), "kradfile-import");
        worker.setDaemon(true);
        worker.start();
        return "KRADFILE import started in the background. Watch the logs for progress.";
    }

    private void runImport(String url, boolean force) {
        long started = System.nanoTime();
        int total = 0;
        try {
            if (force) {
                jdbcTemplate.execute("TRUNCATE TABLE kanji_radical");
                log.info("KRADFILE import: truncated kanji_radical (force)");
            }
            try (InputStream in = openStream(url);
                    BufferedReader reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8))) {
                List<String[]> batch = new ArrayList<>(BATCH_SIZE);
                String line;
                while ((line = reader.readLine()) != null) {
                    KradfileParser.Parsed parsed = parser.parseLine(line);
                    if (parsed == null) {
                        continue;
                    }
                    for (String radical : parsed.radicals()) {
                        batch.add(new String[] {radical, parsed.kanji()});
                    }
                    if (batch.size() >= BATCH_SIZE) {
                        total += flush(batch);
                        log.info("KRADFILE import: {} pairs…", total);
                    }
                }
                total += flush(batch);
            }
            log.info("KRADFILE import complete: {} pairs in {}s", total, (System.nanoTime() - started) / 1_000_000_000);
        } catch (Exception e) {
            log.error("KRADFILE import failed after {} pairs: {}", total, e.getMessage(), e);
        } finally {
            running.set(false);
        }
    }

    private int flush(List<String[]> batch) {
        if (batch.isEmpty()) {
            return 0;
        }
        jdbcTemplate.batchUpdate(INSERT_SQL, batch, batch.size(), (ps, pair) -> {
            ps.setString(1, pair[0]);
            ps.setString(2, pair[1]);
        });
        int n = batch.size();
        batch.clear();
        return n;
    }

    private InputStream openStream(String url) throws Exception {
        InputStream raw = new BufferedInputStream(URI.create(url).toURL().openStream());
        String lower = url.toLowerCase();
        return (lower.endsWith(".gz") || lower.endsWith(".tgz")) ? new GZIPInputStream(raw) : raw;
    }
}
