package com.hoang.basis.yukihon.system.reminder.controller;

import com.hoang.basis.yukihon.system.reminder.dto.ReminderSummaryDto;
import com.hoang.basis.yukihon.system.reminder.service.ReminderService;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reminders")
@RequiredArgsConstructor
public class ReminderController {

    private final ReminderService reminderService;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository
                .findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new com.hoang.basis.yukihon.exception.ResourceNotFoundException("User not found"));
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<ReminderSummaryDto> getReminders(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reminderService.getSummary(getUserId(userDetails)));
    }
}
