package com.hoang.basis.yukihon.system.aichat.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiChatRequest {

    private Long conversationId;

    @NotBlank(message = "mode is required")
    private String mode;

    @Valid
    @NotEmpty(message = "messages must not be empty")
    private List<AiChatMessageRequest> messages;
}
