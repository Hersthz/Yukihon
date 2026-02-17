package com.hoang.basis.yukihon.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleUserInfo {
    private String id;
    private String email;
    private String name;

    @JsonProperty("picture")
    private String picture;

    @JsonProperty("email_verified")
    private Boolean emailVerified;
}
