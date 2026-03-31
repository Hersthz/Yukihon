package com.hoang.basis.yukihon.system.community.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityChatSocketErrorDto {

    private String code;
    private String message;
    private Instant createdAt;
}
