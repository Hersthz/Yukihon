package com.hoang.basis.yukihon.system.privatechat.dto;

import com.hoang.basis.yukihon.system.user.dto.UserDto;
import java.time.Instant;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PrivateMessageDto {
    private Long id;
    private UserDto sender;
    private UserDto receiver;
    private String content;
    private boolean read;
    private Instant createdAt;
}
