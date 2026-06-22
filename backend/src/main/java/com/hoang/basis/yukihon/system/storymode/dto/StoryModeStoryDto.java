package com.hoang.basis.yukihon.system.storymode.dto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoryModeStoryDto {

    private Long id;
    private String storyKey;
    private String title;
    private String subtitle;
    private String description;
    private String jlptLevel;
    private Integer estimatedMinutes;
    private String tone;
    private String coverLabel;
    private String entrySegmentId;
    private boolean published;
    private List<SegmentDto> segments;
    private Instant createdAt;
    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SegmentDto {
        private String id;
        private String title;
        private String sceneHint;
        private String japaneseText;
        private String translation;
        private Map<String, String> translationByDifficulty;

        @Builder.Default
        private List<String> vocabQueries = new ArrayList<>();

        @Builder.Default
        private List<GrammarDto> grammar = new ArrayList<>();

        private CheckpointDto checkpoint;
        private AdaptiveRoutesDto adaptiveRoutes;
        private String nextSegmentId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GrammarDto {
        private String pattern;
        private String title;
        private String explanation;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CheckpointDto {
        private String mode;
        private String question;
        private Map<String, String> questionByDifficulty;

        @Builder.Default
        private List<OptionDto> options = new ArrayList<>();

        private Map<String, List<OptionDto>> optionsByDifficulty;
        private String correctOptionId;
        private String explanation;
        private Map<String, String> explanationByDifficulty;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptionDto {
        private String id;
        private String label;
        private String nextSegmentId;
        private Map<String, String> nextSegmentIdByDifficulty;
        private String difficultyImpact;
        private String response;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdaptiveRoutesDto {
        private String onCorrectNextSegmentId;
        private String onWrongNextSegmentId;
        private Map<String, String> onCorrectByDifficulty;
        private Map<String, String> onWrongByDifficulty;
    }
}
