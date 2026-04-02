package com.hoang.basis.yukihon.system.community.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommunityChatSendRequest {

    @Size(max = 40)
    private String roomId;

    @Size(max = 80)
    private String clientMessageId;

    @NotBlank
    @Size(max = 1000)
    private String content;
}
