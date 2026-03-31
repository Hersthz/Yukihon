package com.hoang.basis.yukihon.system.creatormode.dto;

import com.hoang.basis.yukihon.system.creatormode.entity.CreatorTemplate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatorTemplateDto {

    private Long id;
    private String title;
    private String summary;
    private String contentType;
    private String status;
    private String jlptLevel;
    private String tags;
    private Integer estimatedMinutes;
    private String builderJson;

    private Long createdByUserId;
    private String createdByDisplayName;
    private Long reviewedByUserId;
    private String reviewedByDisplayName;
    private String reviewNote;
    private Long adminReviewedByUserId;
    private String adminReviewedByDisplayName;
    private String adminReviewNote;

    private Integer usageCount;
    private Integer completionCount;
    private BigDecimal averageScore;

    private String createdAt;
    private String updatedAt;
    private String reviewedAt;
    private String adminReviewedAt;
    private String lastPublishedAt;

    public static CreatorTemplateDto fromEntity(CreatorTemplate entity) {
        return CreatorTemplateDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .summary(entity.getSummary())
                .contentType(entity.getContentType().name())
                .status(entity.getStatus().name())
                .jlptLevel(entity.getJlptLevel())
                .tags(entity.getTags())
                .estimatedMinutes(entity.getEstimatedMinutes())
                .builderJson(entity.getBuilderJson())
                .createdByUserId(entity.getCreatedByUserId())
                .createdByDisplayName(entity.getCreatedBy() != null ? entity.getCreatedBy().getDisplayName() : null)
                .reviewedByUserId(entity.getReviewedByUserId())
                .reviewedByDisplayName(entity.getReviewedBy() != null ? entity.getReviewedBy().getDisplayName() : null)
                .reviewNote(entity.getReviewNote())
                .adminReviewedByUserId(entity.getAdminReviewedByUserId())
                .adminReviewedByDisplayName(entity.getAdminReviewedBy() != null ? entity.getAdminReviewedBy().getDisplayName() : null)
                .adminReviewNote(entity.getAdminReviewNote())
                .usageCount(entity.getUsageCount())
                .completionCount(entity.getCompletionCount())
                .averageScore(entity.getAverageScore())
                .createdAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null)
                .updatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt().toString() : null)
                .reviewedAt(entity.getReviewedAt() != null ? entity.getReviewedAt().toString() : null)
                .adminReviewedAt(entity.getAdminReviewedAt() != null ? entity.getAdminReviewedAt().toString() : null)
                .lastPublishedAt(entity.getLastPublishedAt() != null ? entity.getLastPublishedAt().toString() : null)
                .build();
    }
}
