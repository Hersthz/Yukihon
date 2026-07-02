package com.hoang.basis.yukihon.system.kanji.client;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** Pure-logic tests for KanjiVG filename encoding, SVG cleaning, and component extraction. */
class KanjiVgClientTest {

    private final KanjiVgClient client = new KanjiVgClient(null);

    @Test
    @DisplayName("code point is zero-padded 5-digit lowercase hex")
    void codePointHex() {
        assertThat(client.codePointHex("結")).isEqualTo("07d50"); // U+7D50
        assertThat(client.codePointHex("字")).isEqualTo("05b57"); // U+5B57
    }

    @Test
    @DisplayName("clean strips the XML declaration, keeping from <svg> onward")
    void clean() {
        String raw = "<?xml version=\"1.0\"?>\n<!DOCTYPE svg>\n<svg xmlns=\"...\"><g/></svg>";
        assertThat(client.clean(raw)).startsWith("<svg").endsWith("</svg>");
        assertThat(client.clean(null)).isNull();
    }

    @Test
    @DisplayName("parseComponents extracts distinct kvg:element chars, excluding the kanji itself")
    void parseComponents() {
        String svg =
                """
                <svg><g kvg:element="結"><g kvg:element="糸" kvg:radical="general"/>
                <g kvg:element="吉"><g kvg:element="士"/><g kvg:element="口"/></g></g></svg>
                """;
        assertThat(client.parseComponents("結", svg)).isEqualTo("糸,吉,士,口");
    }

    @Test
    @DisplayName("parseComponents returns null when there are no components")
    void parseComponentsEmpty() {
        assertThat(client.parseComponents("一", "<svg><g kvg:element=\"一\"/></svg>"))
                .isNull();
        assertThat(client.parseComponents("一", null)).isNull();
    }
}
