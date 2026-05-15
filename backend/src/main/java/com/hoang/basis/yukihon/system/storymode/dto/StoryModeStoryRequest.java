package com.hoang.basis.yukihon.system.storymode.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoryModeStoryRequest {

    @NotBlank(message = "Story key is required")
    private String storyKey;

    @NotBlank(message = "Title is required")
    private String title;

    private String subtitle;
    private String description;

    @NotBlank(message = "JLPT level is required")
    private String jlptLevel;

    @Min(value = 1, message = "Estimated minutes must be at least 1")
    private Integer estimatedMinutes;

    private String tone;
    private String coverLabel;

    @NotBlank(message = "Entry segment ID is required")
    private String entrySegmentId;

    private boolean published;

    @Valid
    @NotEmpty(message = "At least one segment is required")
    private List<StoryModeStoryDto.SegmentDto> segments;
}
