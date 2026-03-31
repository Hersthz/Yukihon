package com.hoang.basis.yukihon.system.usersettings.service;

import com.hoang.basis.yukihon.system.usersettings.dto.UpdateSettingsRequest;
import com.hoang.basis.yukihon.system.usersettings.dto.UserSettingsDto;
import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.usersettings.entity.UserSettings;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import com.hoang.basis.yukihon.system.usersettings.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserSettingsService {

    private final UserSettingsRepository settingsRepository;
    private final UserRepository userRepository;

    public UserSettingsDto getSettings(Long userId) {
        UserSettings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> initializeSettings(userId));
        return UserSettingsDto.fromEntity(settings);
    }

    @Transactional
    public UserSettingsDto updateSettings(Long userId, UpdateSettingsRequest request) {
        UserSettings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> initializeSettings(userId));

        if (request.getTheme() != null) settings.setTheme(request.getTheme());
        if (request.getLanguage() != null) settings.setLanguage(request.getLanguage());
        if (request.getDailyGoalMinutes() != null) settings.setDailyGoalMinutes(request.getDailyGoalMinutes());
        if (request.getEmailNotifications() != null) settings.setEmailNotifications(request.getEmailNotifications());
        if (request.getPushNotifications() != null) settings.setPushNotifications(request.getPushNotifications());
        if (request.getShowFurigana() != null) settings.setShowFurigana(request.getShowFurigana());
        if (request.getShowRomaji() != null) settings.setShowRomaji(request.getShowRomaji());
        if (request.getAutoPlayAudio() != null) settings.setAutoPlayAudio(request.getAutoPlayAudio());
        if (request.getQuizDifficulty() != null) settings.setQuizDifficulty(request.getQuizDifficulty());
        if (request.getTargetJlptLevel() != null) settings.setTargetJlptLevel(request.getTargetJlptLevel());
        if (request.getJlptDeadlineDate() != null) settings.setJlptDeadlineDate(parseDeadlineDate(request.getJlptDeadlineDate()));

        UserSettings saved = settingsRepository.save(settings);
        log.info("Updated settings for user {}", userId);
        return UserSettingsDto.fromEntity(saved);
    }

    private LocalDate parseDeadlineDate(String rawValue) {
        if (rawValue == null || rawValue.isBlank()) {
            return null;
        }

        try {
            return LocalDate.parse(rawValue.trim());
        } catch (DateTimeParseException exception) {
            throw new IllegalArgumentException("Invalid jlptDeadlineDate format. Expected yyyy-MM-dd");
        }
    }

    @Transactional
    public UserSettings initializeSettings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserSettings settings = UserSettings.builder()
                .user(user)
                .build();

        return settingsRepository.save(settings);
    }
}
