package com.hoang.basis.yukihon.system.notification.dto;

import com.hoang.basis.yukihon.system.notification.entity.Notification;
import java.time.Instant;

public record NotificationDto(
        Long id, String type, String title, String message, String link, boolean read, Instant createdAt) {
    public static NotificationDto fromEntity(Notification n) {
        return new NotificationDto(
                n.getId(), n.getType(), n.getTitle(), n.getMessage(), n.getLink(), n.isRead(), n.getCreatedAt());
    }
}
