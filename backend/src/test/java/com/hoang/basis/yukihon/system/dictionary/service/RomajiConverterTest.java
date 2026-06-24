package com.hoang.basis.yukihon.system.dictionary.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class RomajiConverterTest {

    @Test
    void convertsBasicAndYouonAndSokuonAndChoonpu() {
        assertThat(RomajiConverter.toRomaji("としょかん")).isEqualTo("toshokan");
        assertThat(RomajiConverter.toRomaji("べんきょう")).isEqualTo("benkyou");
        assertThat(RomajiConverter.toRomaji("がっこう")).isEqualTo("gakkou"); // sokuon doubles k
        assertThat(RomajiConverter.toRomaji("しゅくだい")).isEqualTo("shukudai"); // youon しゅ
        assertThat(RomajiConverter.toRomaji("コーヒー")).isEqualTo("koohii"); // katakana + chōonpu
    }

    @Test
    void handlesNullAndUnknown() {
        assertThat(RomajiConverter.toRomaji(null)).isNull();
        assertThat(RomajiConverter.toRomaji("")).isNull();
        assertThat(RomajiConverter.toRomaji("ABC")).isNull(); // no kana → null
    }
}
