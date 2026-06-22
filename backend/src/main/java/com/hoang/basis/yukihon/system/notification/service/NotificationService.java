package com.hoang.basis.yukihon.system.notification.service;

import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.system.notification.dto.NotificationDto;
import com.hoang.basis.yukihon.system.notification.entity.Notification;
import com.hoang.basis.yukihon.system.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    /** Creates a notification for a user. Intended for other modules (gamification, reminders, etc.). */
    @Transactional
    public Notification create(Long userId, String type, String title, String message, String link) {
        return notificationRepository.save(Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .link(link)
                .read(false)
                .build());
    }

    @Transactional(readOnly = true)
    public Page<NotificationDto> list(Long userId, Pageable pageable) {
        return notificationRepository
                .findByUserIdOrderByIdDesc(userId, pageable)
                .map(NotificationDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public NotificationDto markRead(Long id, Long userId) {
        Notification notification = notificationRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));
        notification.setRead(true);
        return NotificationDto.fromEntity(notificationRepository.save(notification));
    }

    @Transactional
    public int markAllRead(Long userId) {
        return notificationRepository.markAllRead(userId);
    }
}
