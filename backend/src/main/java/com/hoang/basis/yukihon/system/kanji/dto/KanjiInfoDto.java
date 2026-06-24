package com.hoang.basis.yukihon.system.kanji.dto;

import java.util.List;

/** Kanji metadata returned to the client (readings split into lists for display). */
public record KanjiInfoDto(
        String character,
        String meaning,
        List<String> onReadings,
        List<String> kunReadings,
        Integer strokeCount,
        String jlptLevel) {}
