package com.hoang.basis.yukihon.system.community.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommunityChatTypingRequest {

    private String roomId;
    private boolean typing;
}
