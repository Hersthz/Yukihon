package com.hoang.basis.yukihon.system.srs.dto;

/** A selectable SRS algorithm preset for the deck settings picker. */
public record AlgorithmConfigDto(Long id, String code, String name, String algorithmType) {}
