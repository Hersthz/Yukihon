package com.hoang.basis.yukihon.system.creatormode.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatorTemplateAnalyticsItemDto {
    private Long id;
    private String title;
    private String contentType;
    private Integer usageCount;
    private Integer completionCount;
    private BigDecimal completionRate;
    private BigDecimal averageScore;
}
