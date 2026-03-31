package com.hoang.basis.yukihon.system.usersettings.dto;

import com.hoang.basis.yukihon.system.usersettings.entity.UserSettings;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

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
    private LocalDate jlptDeadlineDate;

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
                .jlptDeadlineDate(settings.getJlptDeadlineDate())
                .build();
    }
}
