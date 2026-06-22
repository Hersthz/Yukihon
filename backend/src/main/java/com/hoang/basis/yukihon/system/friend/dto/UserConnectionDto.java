package com.hoang.basis.yukihon.system.friend.dto;

import com.hoang.basis.yukihon.system.friend.entity.ConnectionStatus;
import com.hoang.basis.yukihon.system.friend.entity.ConnectionType;
import com.hoang.basis.yukihon.system.user.dto.UserDto;
import java.time.Instant;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserConnectionDto {
    private Long id;
    private UserDto requester;
    private UserDto receiver;
    private ConnectionType type;
    private ConnectionStatus status;
    private Instant createdAt;
    private Instant updatedAt;
}
