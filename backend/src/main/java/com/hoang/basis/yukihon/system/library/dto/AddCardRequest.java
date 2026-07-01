package com.hoang.basis.yukihon.system.library.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddCardRequest {

    @NotBlank
    private String front;

    @NotBlank
    private String back;

    private String hint;

    /** FORWARD (default) | FORWARD_REVERSE — study template for the new card. */
    private String template;
}
