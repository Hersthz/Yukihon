package com.hoang.basis.yukihon.dto.settings;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSettingsRequest {

    private String theme;
    private String language;
    private Integer dailyGoalMinutes;
    private Boolean emailNotifications;
    private Boolean pushNotifications;
    private Boolean showFurigana;
    private Boolean showRomaji;
    private Boolean autoPlayAudio;
    private String quizDifficulty;
    private String targetJlptLevel;
}
