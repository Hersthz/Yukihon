package com.hoang.basis.yukihon.system.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GoogleUserInfo {
    private String id;
    private String email;
    private String name;

    @JsonProperty("picture")
    private String picture;

    @JsonProperty("verified_email")
    private Boolean emailVerified;
}
