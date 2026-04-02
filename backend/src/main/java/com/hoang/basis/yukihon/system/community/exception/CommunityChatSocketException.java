package com.hoang.basis.yukihon.system.community.exception;

import lombok.Getter;

@Getter
public class CommunityChatSocketException extends RuntimeException {

    private final String code;
    private final String clientMessageId;

    public CommunityChatSocketException(String code, String message, String clientMessageId) {
        super(message);
        this.code = code;
        this.clientMessageId = clientMessageId;
    }
}
