package com.hoang.basis.yukihon.system.dictionary.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.hoang.basis.yukihon.system.dictionary.dto.FuriganaToken;
import java.util.List;
import java.util.stream.Collectors;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** Verifies furigana alignment: ruby only over kanji, okurigana kept plain, text is lossless. */
class FuriganaServiceTest {

    private final FuriganaService service = new FuriganaService();

    private String concat(List<FuriganaToken> tokens) {
        return tokens.stream().map(FuriganaToken::text).collect(Collectors.joining());
    }

    @Test
    @DisplayName("Whole-word kanji gets its reading as ruby")
    void wordLevelRuby() {
        List<FuriganaToken> tokens = service.annotate("勉強する");
        assertThat(concat(tokens)).isEqualTo("勉強する");
        assertThat(tokens).anySatisfy(t -> {
            assertThat(t.text()).isEqualTo("勉強");
            assertThat(t.ruby()).isEqualTo("べんきょう");
        });
    }

    @Test
    @DisplayName("Okurigana stays plain — ruby only over the kanji stem (食べる → 食:た + べる)")
    void okuriganaKeptPlain() {
        List<FuriganaToken> tokens = service.annotate("食べる");
        assertThat(concat(tokens)).isEqualTo("食べる");
        assertThat(tokens).anySatisfy(t -> {
            assertThat(t.text()).isEqualTo("食");
            assertThat(t.ruby()).isEqualTo("た");
        });
        assertThat(tokens).anySatisfy(t -> {
            assertThat(t.text()).isEqualTo("べる");
            assertThat(t.ruby()).isNull();
        });
    }

    @Test
    @DisplayName("Katakana-only words carry no ruby")
    void katakanaNoRuby() {
        List<FuriganaToken> tokens = service.annotate("ラーメン");
        assertThat(concat(tokens)).isEqualTo("ラーメン");
        assertThat(tokens).allSatisfy(t -> assertThat(t.ruby()).isNull());
    }

    @Test
    @DisplayName("Blank input yields no tokens")
    void blank() {
        assertThat(service.annotate("")).isEmpty();
        assertThat(service.annotate(null)).isEmpty();
    }
}
