package com.hoang.basis.yukihon.system.analytics.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class LearningAnalyticsEventRequest {

    @NotBlank
    private String eventType;

    @NotBlank
    private String contentType;

    @NotNull
    private Long contentId;

    private String sessionId;

    private String jlptLevel;

    @Min(0)
    private Integer durationSeconds;

    @Min(0)
    private Integer score;

    private Map<String, Object> metadata;
}
