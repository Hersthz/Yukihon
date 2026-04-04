package com.hoang.basis.yukihon.system.aichat.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiChatMessageRequest {

    @NotBlank(message = "role is required")
    private String role;

    @NotBlank(message = "text is required")
    private String text;
}
