package com.hoang.basis.yukihon.system.dictionary.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** Pure-logic tests for KRADFILE line parsing. */
class KradfileParserTest {

    private final KradfileParser parser = new KradfileParser();

    @Test
    @DisplayName("parses a kanji and its space-separated radicals")
    void parsesLine() {
        KradfileParser.Parsed parsed = parser.parseLine("明 : 日 月");
        assertThat(parsed).isNotNull();
        assertThat(parsed.kanji()).isEqualTo("明");
        assertThat(parsed.radicals()).containsExactly("日", "月");
    }

    @Test
    @DisplayName("ignores comments, blanks, and malformed lines")
    void ignoresNonData() {
        assertThat(parser.parseLine("# comment")).isNull();
        assertThat(parser.parseLine("   ")).isNull();
        assertThat(parser.parseLine(null)).isNull();
        assertThat(parser.parseLine("no-colon-here")).isNull();
        assertThat(parser.parseLine("明 : ")).isNull();
    }
}
