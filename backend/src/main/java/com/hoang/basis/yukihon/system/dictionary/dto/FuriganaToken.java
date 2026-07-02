package com.hoang.basis.yukihon.system.dictionary.dto;

/** A slice of Japanese text: {@code ruby} holds the reading when {@code text} is kanji, else null. */
public record FuriganaToken(String text, String ruby) {}
