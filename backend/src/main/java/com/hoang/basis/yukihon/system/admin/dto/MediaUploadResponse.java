package com.hoang.basis.yukihon.system.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaUploadResponse {
    private String url;
    private String filename;
    private String contentType;
    private long size;
}
