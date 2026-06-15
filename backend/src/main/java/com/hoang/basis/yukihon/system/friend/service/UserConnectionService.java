package com.hoang.basis.yukihon.system.friend.service;

import com.hoang.basis.yukihon.system.friend.dto.UserConnectionDto;
import com.hoang.basis.yukihon.system.friend.entity.ConnectionStatus;
import com.hoang.basis.yukihon.system.friend.entity.ConnectionType;
import com.hoang.basis.yukihon.system.friend.entity.UserConnection;
import com.hoang.basis.yukihon.system.friend.repository.UserConnectionRepository;
import com.hoang.basis.yukihon.system.user.dto.UserDto;
import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserConnectionService {

    private final UserConnectionRepository userConnectionRepository;
    private final UserRepository userRepository;

    @Transactional
    public UserConnectionDto createConnection(Long requesterId, Long receiverId, ConnectionType type) {
        if (requesterId.equals(receiverId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot act on yourself");
        }

        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Requester not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receiver not found"));

        if (userConnectionRepository.findByRequesterAndReceiverAndType(requester, receiver, type).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Connection already exists");
        }
        
        ConnectionStatus status = type == ConnectionType.FOLLOW ? ConnectionStatus.ACCEPTED : ConnectionStatus.PENDING;

        UserConnection connection = UserConnection.builder()
                .requester(requester)
                .receiver(receiver)
                .type(type)
                .status(status)
                .build();

        return mapToDto(userConnectionRepository.save(connection));
    }

    @Transactional
    public UserConnectionDto acceptConnection(Long receiverId, Long connectionId) {
        UserConnection connection = userConnectionRepository.findById(connectionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Connection not found"));

        if (!connection.getReceiver().getId().equals(receiverId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to accept this connection");
        }

        connection.setStatus(ConnectionStatus.ACCEPTED);
        return mapToDto(userConnectionRepository.save(connection));
    }

    @Transactional
    public void deleteConnection(Long userId, Long connectionId) {
        UserConnection connection = userConnectionRepository.findById(connectionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Connection not found"));

        if (!connection.getRequester().getId().equals(userId) && !connection.getReceiver().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to delete this connection");
        }

        userConnectionRepository.delete(connection);
    }

    @Transactional(readOnly = true)
    public List<UserConnectionDto> getConnections(Long userId, ConnectionType type, ConnectionStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return userConnectionRepository.findConnectionsByUser(user, type, status)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<UserConnectionDto> getPendingRequests(Long userId, ConnectionType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return userConnectionRepository.findByReceiverAndTypeAndStatus(user, type, ConnectionStatus.PENDING)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private UserConnectionDto mapToDto(UserConnection connection) {
        return UserConnectionDto.builder()
                .id(connection.getId())
                .requester(mapToUserDto(connection.getRequester()))
                .receiver(mapToUserDto(connection.getReceiver()))
                .type(connection.getType())
                .status(connection.getStatus())
                .createdAt(connection.getCreatedAt())
                .updatedAt(connection.getUpdatedAt())
                .build();
    }

    private UserDto mapToUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .build();
    }
}
