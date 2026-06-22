package com.hoang.basis.yukihon.system.community.dto;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityChatSocketErrorDto {

    private String code;
    private String message;
    private String clientMessageId;
    private Instant createdAt;
}
