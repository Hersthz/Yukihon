package com.hoang.basis.yukihon.system.friend.dto;

import com.hoang.basis.yukihon.system.user.dto.UserDto;
import lombok.Builder;
import lombok.Data;

/** A user matched by friend search, annotated with the caller's relationship to them. */
@Data
@Builder
public class FriendSearchResultDto {
    private UserDto user;
    private String status; // NONE | PENDING | FRIENDS
    private Long connectionId; // set when a connection exists (for accept/cancel/unfriend)
    private boolean incoming; // PENDING request where the caller is the receiver → can accept
}
