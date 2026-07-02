package com.hoang.basis.yukihon.system.dictionary.dto;

import java.util.List;

/** Batch of Japanese texts to annotate with furigana. */
public record FuriganaRequest(List<String> texts) {}
