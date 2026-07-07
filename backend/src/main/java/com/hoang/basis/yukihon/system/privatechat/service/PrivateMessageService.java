package com.hoang.basis.yukihon.system.privatechat.service;

import com.hoang.basis.yukihon.system.privatechat.dto.PrivateMessageDto;
import com.hoang.basis.yukihon.system.privatechat.dto.ReadReceiptEvent;
import com.hoang.basis.yukihon.system.privatechat.dto.UnreadSummaryDto;
import com.hoang.basis.yukihon.system.privatechat.entity.PrivateMessage;
import com.hoang.basis.yukihon.system.privatechat.repository.PrivateMessageRepository;
import com.hoang.basis.yukihon.system.user.dto.UserDto;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class PrivateMessageService {

    private final PrivateMessageRepository privateMessageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public PrivateMessageDto saveMessage(Long senderId, Long receiverId, String content) {
        User sender = userRepository
                .findById(senderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sender not found"));
        User receiver = userRepository
                .findById(receiverId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receiver not found"));

        PrivateMessage message = PrivateMessage.builder()
                .sender(sender)
                .receiver(receiver)
                .content(content)
                .read(false)
                .build();

        return mapToDto(privateMessageRepository.save(message));
    }

    @Transactional(readOnly = true)
    public Page<PrivateMessageDto> getConversation(Long userId, Long otherUserId, Pageable pageable) {
        User user1 = userRepository
                .findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        User user2 = userRepository
                .findById(otherUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Other user not found"));

        return privateMessageRepository.findConversation(user1, user2, pageable).map(this::mapToDto);
    }

    /** Mark all messages the reader received from `otherUserId` as read; notify the sender ("seen"). */
    @Transactional
    public int markConversationRead(Long readerId, Long otherUserId) {
        User reader = userRepository
                .findById(readerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        User other = userRepository
                .findById(otherUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Other user not found"));

        int updated = privateMessageRepository.markConversationRead(reader, other);
        if (updated > 0) {
            messagingTemplate.convertAndSendToUser(
                    other.getEmail(), "/queue/private-read", new ReadReceiptEvent(readerId));
        }
        return updated;
    }

    @Transactional(readOnly = true)
    public UnreadSummaryDto getUnreadSummary(Long userId) {
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        long total = privateMessageRepository.countByReceiverAndReadFalse(user);
        List<UnreadSummaryDto.UnreadCount> perUser = privateMessageRepository.countUnreadPerSender(user).stream()
                .map(p -> new UnreadSummaryDto.UnreadCount(p.getSenderId(), p.getCnt()))
                .toList();
        return new UnreadSummaryDto(total, perUser);
    }

    private PrivateMessageDto mapToDto(PrivateMessage message) {
        return PrivateMessageDto.builder()
                .id(message.getId())
                .sender(mapToUserDto(message.getSender()))
                .receiver(mapToUserDto(message.getReceiver()))
                .content(message.getContent())
                .read(message.isRead())
                .createdAt(message.getCreatedAt())
                .build();
    }

    private UserDto mapToUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
