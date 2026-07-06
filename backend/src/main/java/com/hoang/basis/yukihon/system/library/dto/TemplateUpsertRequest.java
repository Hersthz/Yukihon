package com.hoang.basis.yukihon.system.library.dto;

import jakarta.validation.constraints.NotBlank;

/** Create/update a personal card template. */
public record TemplateUpsertRequest(
        @NotBlank String name,
        String cardType,
        String description,
        String frontTemplate,
        String backTemplate,
        String styling) {}
