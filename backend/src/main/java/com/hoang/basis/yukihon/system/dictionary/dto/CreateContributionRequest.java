package com.hoang.basis.yukihon.system.dictionary.dto;

import jakarta.validation.constraints.NotBlank;

/** Submit a community meaning/example for a headword. */
public record CreateContributionRequest(
        @NotBlank String headword, @NotBlank String type, @NotBlank String content, String translation) {}
