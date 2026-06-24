package com.hoang.basis.yukihon.system.kanji.client;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoang.basis.yukihon.system.kanji.entity.KanjiInfo;
import org.junit.jupiter.api.Test;

/** Tests the pure parsing of {@link KanjiApiClient} against the kanjiapi.dev shape. */
class KanjiApiClientTest {

    private final KanjiApiClient client = new KanjiApiClient(null, new ObjectMapper());

    private static final String JSON =
            """
            {"kanji":"字","grade":1,"stroke_count":6,
             "meanings":["character","letter","word"],
             "kun_readings":["あざ","あざな"],"on_readings":["ジ"],
             "jlpt":4,"unicode":"5b57"}
            """;

    @Test
    void parsesReadingsMeaningsStrokesAndJlpt() {
        KanjiInfo k = client.parse("字", JSON);

        assertThat(k).isNotNull();
        assertThat(k.getCharacter()).isEqualTo("字");
        assertThat(k.getMeaning()).isEqualTo("character; letter; word");
        assertThat(k.getOnReadings()).isEqualTo("ジ");
        assertThat(k.getKunReadings()).isEqualTo("あざ, あざな");
        assertThat(k.getStrokeCount()).isEqualTo(6);
        assertThat(k.getJlptLevel()).isEqualTo("N5"); // former JLPT 4 → N5
    }

    @Test
    void returnsNullForBlankOrNoMeanings() {
        assertThat(client.parse("字", null)).isNull();
        assertThat(client.parse("字", "")).isNull();
        assertThat(client.parse("字", "{\"meanings\":[]}")).isNull();
    }
}
