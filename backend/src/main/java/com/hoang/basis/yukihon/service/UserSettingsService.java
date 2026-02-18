package com.hoang.basis.yukihon.service;

import com.hoang.basis.yukihon.dto.settings.UpdateSettingsRequest;
import com.hoang.basis.yukihon.dto.settings.UserSettingsDto;
import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.model.User;
import com.hoang.basis.yukihon.model.UserSettings;
import com.hoang.basis.yukihon.repository.UserRepository;
import com.hoang.basis.yukihon.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        UserSettings saved = settingsRepository.save(settings);
        log.info("Updated settings for user {}", userId);
        return UserSettingsDto.fromEntity(saved);
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
