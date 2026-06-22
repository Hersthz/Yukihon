package com.hoang.basis.yukihon.system.usersettings.controller;

import com.hoang.basis.yukihon.base.security.CurrentUserId;
import com.hoang.basis.yukihon.system.usersettings.dto.UpdateSettingsRequest;
import com.hoang.basis.yukihon.system.usersettings.dto.UserSettingsDto;
import com.hoang.basis.yukihon.system.usersettings.service.UserSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class UserSettingsController {

    private final UserSettingsService settingsService;

    @GetMapping
    public ResponseEntity<UserSettingsDto> getSettings(@CurrentUserId Long userId) {
        return ResponseEntity.ok(settingsService.getSettings(userId));
    }

    @PutMapping
    public ResponseEntity<UserSettingsDto> updateSettings(
            @CurrentUserId Long userId, @RequestBody UpdateSettingsRequest request) {
        return ResponseEntity.ok(settingsService.updateSettings(userId, request));
    }
}
