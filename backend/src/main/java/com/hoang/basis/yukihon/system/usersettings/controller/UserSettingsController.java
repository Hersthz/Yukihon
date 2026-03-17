package com.hoang.basis.yukihon.system.usersettings.controller;

import com.hoang.basis.yukihon.system.usersettings.dto.UpdateSettingsRequest;
import com.hoang.basis.yukihon.system.usersettings.dto.UserSettingsDto;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import com.hoang.basis.yukihon.system.usersettings.service.UserSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class UserSettingsController {

    private final UserSettingsService settingsService;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<UserSettingsDto> getSettings(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(settingsService.getSettings(userId));
    }

    @PutMapping
    public ResponseEntity<UserSettingsDto> updateSettings(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateSettingsRequest request
    ) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(settingsService.updateSettings(userId, request));
    }
}
