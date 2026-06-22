package com.hoang.basis.yukihon.system.mistakedna.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MistakePatternDto {
    private String key;
    private String title;
    private String description;
    private String severity;
    private String metricLabel;
    private Integer metricValue;
    private String insight;
    private String recommendedAction;
    private List<String> evidence;
}
