package com.hoang.basis.yukihon.system.auth.dto;

import lombok.Data;

@Data
public class GoogleTokenRequest {
    private String code;
    private String redirectUri;
}
