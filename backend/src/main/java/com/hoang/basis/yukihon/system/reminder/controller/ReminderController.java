package com.hoang.basis.yukihon.system.reminder.controller;

import com.hoang.basis.yukihon.base.security.CurrentUserId;
import com.hoang.basis.yukihon.system.reminder.dto.ReminderSummaryDto;
import com.hoang.basis.yukihon.system.reminder.service.ReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reminders")
@RequiredArgsConstructor
public class ReminderController {

    private final ReminderService reminderService;

    @GetMapping
    public ResponseEntity<ReminderSummaryDto> getReminders(@CurrentUserId Long userId) {
        return ResponseEntity.ok(reminderService.getSummary(userId));
    }
}
