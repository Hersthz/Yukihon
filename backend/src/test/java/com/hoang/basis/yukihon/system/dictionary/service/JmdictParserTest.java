package com.hoang.basis.yukihon.system.dictionary.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hoang.basis.yukihon.system.dictionary.entity.DictWord;
import org.junit.jupiter.api.Test;

/** Tests {@link JmdictParser} against the jmdict-simplified word shape. */
class JmdictParserTest {

    private final JmdictParser parser = new JmdictParser();
    private final ObjectMapper mapper = new ObjectMapper();

    private JsonNode word(String json) throws Exception {
        return mapper.readTree(json);
    }

    @Test
    void parsesKanjiWordWithGlossesAndPos() throws Exception {
        DictWord w = parser.parse(
                word(
                        """
                {"id":"1578850",
                 "kanji":[{"text":"勉強","common":true}],
                 "kana":[{"text":"べんきょう","common":true}],
                 "sense":[{"partOfSpeech":["n","vs"],
                           "gloss":[{"lang":"eng","text":"study"},{"lang":"eng","text":"diligence"}]}]}
                """));

        assertThat(w).isNotNull();
        assertThat(w.getJmdictId()).isEqualTo("1578850");
        assertThat(w.getKanji()).isEqualTo("勉強");
        assertThat(w.getKana()).isEqualTo("べんきょう");
        assertThat(w.isCommon()).isTrue();
        assertThat(w.getGlossesEn()).isEqualTo("study; diligence");
        assertThat(w.getPartOfSpeech()).isEqualTo("n, vs");
    }

    @Test
    void picksFirstCommonFormAsPrimary() throws Exception {
        DictWord w = parser.parse(
                word(
                        """
                {"id":"1","kanji":[{"text":"rare","common":false},{"text":"常用","common":true}],
                 "kana":[{"text":"よみ","common":false}],
                 "sense":[{"partOfSpeech":["n"],"gloss":[{"lang":"eng","text":"x"}]}]}
                """));

        assertThat(w.getKanji()).isEqualTo("常用"); // first common, not first overall
        assertThat(w.getKana()).isEqualTo("よみ"); // falls back to first when none common
        assertThat(w.isCommon()).isTrue(); // a common kanji form
    }

    @Test
    void handlesKanaOnlyWord() throws Exception {
        DictWord w = parser.parse(
                word(
                        """
                {"id":"2","kana":[{"text":"かな","common":false}],
                 "sense":[{"partOfSpeech":["n"],"gloss":[{"lang":"eng","text":"kana word"}]}]}
                """));

        assertThat(w).isNotNull();
        assertThat(w.getKanji()).isNull();
        assertThat(w.getKana()).isEqualTo("かな");
        assertThat(w.isCommon()).isFalse();
    }

    @Test
    void returnsNullWhenNoReadingOrNoGloss() throws Exception {
        assertThat(parser.parse(
                        word("{\"id\":\"3\",\"kanji\":[{\"text\":\"漢\"}],\"sense\":[{\"gloss\":[{\"text\":\"x\"}]}]}")))
                .isNull(); // no kana
        assertThat(parser.parse(word("{\"id\":\"4\",\"kana\":[{\"text\":\"なし\"}],\"sense\":[{\"gloss\":[]}]}")))
                .isNull(); // no gloss
    }
}
