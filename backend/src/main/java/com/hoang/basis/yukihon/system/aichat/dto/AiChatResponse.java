package com.hoang.basis.yukihon.system.aichat.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AiChatResponse {
    private final String reply;
    private final String model;
    private final String mode;
    private final Long conversationId;
    private final String conversationTitle;
}
