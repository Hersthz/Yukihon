package com.hoang.basis.yukihon.system.kanjisrs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddKanjiSrsRequest {

    @NotBlank(message = "Kanji character is required")
    @Size(max = 16, message = "Kanji character is too long")
    private String character;
}
