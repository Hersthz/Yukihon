package com.hoang.basis.yukihon.system.kanji.service;

import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.kanji.client.KanjiApiClient;
import com.hoang.basis.yukihon.system.kanji.client.KanjiVgClient;
import com.hoang.basis.yukihon.system.kanji.dto.KanjiInfoDto;
import com.hoang.basis.yukihon.system.kanji.entity.KanjiInfo;
import com.hoang.basis.yukihon.system.kanji.repository.KanjiInfoRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Kanji metadata, cache-on-demand from kanjiapi.dev + KanjiVG stroke order. */
@Service
@RequiredArgsConstructor
public class KanjiService {

    private final KanjiInfoRepository repository;
    private final KanjiApiClient client;
    private final KanjiVgClient kanjiVgClient;

    @Value("${app.dictionary.external-enabled:true}")
    private boolean externalEnabled;

    @Transactional
    public KanjiInfoDto getKanji(String character) {
        String c = character == null ? "" : character.trim();
        if (c.isEmpty()) {
            throw new ResourceNotFoundException("No kanji character provided");
        }

        KanjiInfo info = repository.findByCharacter(c).orElseGet(() -> {
            KanjiInfo fetched = client.fetch(c);
            return fetched != null ? repository.save(fetched) : null;
        });
        if (info == null) {
            throw new ResourceNotFoundException("Kanji not found: " + c);
        }

        // Backfill stroke-order SVG + components once (also for kanji cached before this feature).
        if (info.getStrokeSvg() == null && externalEnabled) {
            String svg = kanjiVgClient.fetch(c);
            if (svg != null) {
                info.setStrokeSvg(svg);
                info.setComponents(kanjiVgClient.parseComponents(c, svg));
                info = repository.save(info);
            }
        }
        return toDto(info);
    }

    private KanjiInfoDto toDto(KanjiInfo k) {
        return new KanjiInfoDto(
                k.getCharacter(),
                k.getMeaning(),
                splitList(k.getOnReadings(), ", "),
                splitList(k.getKunReadings(), ", "),
                k.getStrokeCount(),
                k.getJlptLevel(),
                k.getFrequency(),
                k.getStrokeSvg(),
                splitList(k.getComponents(), ","));
    }

    private List<String> splitList(String joined, String sep) {
        if (joined == null || joined.isBlank()) {
            return List.of();
        }
        return List.of(joined.split(sep));
    }
}
