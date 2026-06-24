package com.hoang.basis.yukihon.system.dictionary.client;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoang.basis.yukihon.system.dictionary.client.TatoebaClient.TatoebaResult;
import java.util.List;
import org.junit.jupiter.api.Test;

/** Tests the pure JSON parsing of {@link TatoebaClient} (no HTTP), against the real response shape. */
class TatoebaClientTest {

    private final TatoebaClient client = new TatoebaClient(null, new ObjectMapper());

    // Mirrors api.tatoeba.org/v1/sentences: data[].{id,text,translations[].{text,lang}}
    private static final String JSON =
            """
            {"data":[
              {"id":1,"text":"私は毎日勉強します。","lang":"jpn","translations":[
                 {"text":"Tôi học mỗi ngày.","lang":"vie","is_direct":true},
                 {"text":"I study every day.","lang":"eng"}]},
              {"id":2,"text":"勉強は大切です。","lang":"jpn","translations":[
                 {"text":"Studying is important.","lang":"eng"}]}
            ],"paging":{"total":2}}
            """;

    @Test
    void parsesVietnameseTranslations() {
        List<TatoebaResult> results = client.parse(JSON, "vie");

        assertThat(results).hasSize(1); // only sentence 1 has a Vietnamese translation
        assertThat(results.get(0).jpnId()).isEqualTo(1);
        assertThat(results.get(0).jpnText()).isEqualTo("私は毎日勉強します。");
        assertThat(results.get(0).translation()).isEqualTo("Tôi học mỗi ngày.");
    }

    @Test
    void parsesEnglishTranslations() {
        List<TatoebaResult> results = client.parse(JSON, "eng");

        assertThat(results).hasSize(2); // both sentences have an English translation
        assertThat(results)
                .extracting(TatoebaResult::translation)
                .containsExactly("I study every day.", "Studying is important.");
    }

    @Test
    void returnsEmptyForBlankOrMissingData() {
        assertThat(client.parse(null, "vie")).isEmpty();
        assertThat(client.parse("", "vie")).isEmpty();
        assertThat(client.parse("{\"data\":[]}", "vie")).isEmpty();
        assertThat(client.parse("not json", "vie")).isEmpty();
    }
}
