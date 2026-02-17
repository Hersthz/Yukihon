package com.hoang.basis.yukihon.dto.auth;

import lombok.Data;

@Data
public class GoogleTokenRequest {
    private String code;
    private String redirectUri;
}
