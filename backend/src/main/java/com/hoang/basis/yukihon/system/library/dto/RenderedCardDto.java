package com.hoang.basis.yukihon.system.library.dto;

/** A card rendered through its template: ready-to-inject HTML for both faces + scoped CSS. */
public record RenderedCardDto(String frontHtml, String backHtml, String styling) {}
