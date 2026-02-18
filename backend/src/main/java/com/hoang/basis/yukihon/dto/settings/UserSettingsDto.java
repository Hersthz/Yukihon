package com.hoang.basis.yukihon.dto.settings;

import com.hoang.basis.yukihon.model.UserSettings;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSettingsDto {

    private Long id;
    private String theme;
    private String language;
    private int dailyGoalMinutes;
    private boolean emailNotifications;
    private boolean pushNotifications;
    private boolean showFurigana;
    private boolean showRomaji;
    private boolean autoPlayAudio;
    private String quizDifficulty;
    private String targetJlptLevel;

    public static UserSettingsDto fromEntity(UserSettings settings) {
        return UserSettingsDto.builder()
                .id(settings.getId())
                .theme(settings.getTheme())
                .language(settings.getLanguage())
                .dailyGoalMinutes(settings.getDailyGoalMinutes())
                .emailNotifications(settings.isEmailNotifications())
                .pushNotifications(settings.isPushNotifications())
                .showFurigana(settings.isShowFurigana())
                .showRomaji(settings.isShowRomaji())
                .autoPlayAudio(settings.isAutoPlayAudio())
                .quizDifficulty(settings.getQuizDifficulty())
                .targetJlptLevel(settings.getTargetJlptLevel())
                .build();
    }
}
