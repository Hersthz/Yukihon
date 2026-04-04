package com.hoang.basis.yukihon.system.aichat.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AiChatRequest {

    @NotBlank(message = "mode is required")
    private String mode;

    @Valid
    @NotEmpty(message = "messages must not be empty")
    private List<AiChatMessageRequest> messages;
}
