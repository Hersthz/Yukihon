package com.hoang.basis.yukihon.service;

import com.hoang.basis.yukihon.dto.admin.SystemStatsDto;
import com.hoang.basis.yukihon.dto.admin.UpdateUserRolesRequest;
import com.hoang.basis.yukihon.dto.admin.UpdateUserStatusRequest;
import com.hoang.basis.yukihon.dto.admin.UserManagementDto;
import com.hoang.basis.yukihon.exception.ResourceNotFoundException;
import com.hoang.basis.yukihon.model.RoleName;
import com.hoang.basis.yukihon.model.User;
import com.hoang.basis.yukihon.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final VocabularyRepository vocabularyRepository;
    private final GrammarRepository grammarRepository;
    private final QuizRepository quizRepository;

    /**
     * Get all users with pagination
     */
    public Page<UserManagementDto> getAllUsers(Pageable pageable) {
        log.info("Fetching all users with pagination: {}", pageable);
        return userRepository.findAll(pageable)
                .map(UserManagementDto::fromEntity);
    }

    /**
     * Get user by ID
     */
    public UserManagementDto getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return UserManagementDto.fromEntity(user);
    }

    /**
     * Update user roles
     */
    @Transactional
    public UserManagementDto updateUserRoles(Long userId, UpdateUserRolesRequest request) {
        log.info("Updating roles for user {}: {}", userId, request.getRoles());
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Set<RoleName> roles = request.getRoles().stream()
                .map(String::toUpperCase)
                .map(RoleName::valueOf)
                .collect(Collectors.toSet());

        user.setRoles(roles);
        User updated = userRepository.save(user);
        
        log.info("Successfully updated roles for user {}", userId);
        return UserManagementDto.fromEntity(updated);
    }

    /**
     * Update user enabled/disabled status
     */
    @Transactional
    public UserManagementDto updateUserStatus(Long userId, UpdateUserStatusRequest request) {
        log.info("Updating status for user {}: enabled={}", userId, request.getEnabled());
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setEnabled(request.getEnabled());
        User updated = userRepository.save(user);
        
        log.info("Successfully updated status for user {}", userId);
        return UserManagementDto.fromEntity(updated);
    }

    /**
     * Delete user (soft delete by disabling)
     */
    @Transactional
    public void deleteUser(Long userId) {
        log.info("Deleting user {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setEnabled(false);
        userRepository.save(user);
        
        log.info("Successfully disabled user {}", userId);
    }

    /**
     * Get system statistics for admin dashboard
     */
    public SystemStatsDto getSystemStats() {
        log.info("Fetching system statistics");
        
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByEnabled(true);
        long adminUsers = userRepository.findAll().stream()
                .filter(user -> user.getRoles().contains(RoleName.ADMIN))
                .count();
        long totalLessons = lessonRepository.count();
        long totalVocabulary = vocabularyRepository.count();
        long totalGrammar = grammarRepository.count();
        long totalQuizzes = quizRepository.count();

        return SystemStatsDto.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .adminUsers(adminUsers)
                .totalLessons(totalLessons)
                .totalVocabulary(totalVocabulary)
                .totalGrammar(totalGrammar)
                .totalQuizzes(totalQuizzes)
                .build();
    }

    /**
     * Search users by email or display name
     */
    public List<UserManagementDto> searchUsers(String query) {
        log.info("Searching users with query: {}", query);
        
        List<User> users = userRepository.findAll().stream()
                .filter(user -> 
                    user.getEmail().toLowerCase().contains(query.toLowerCase()) ||
                    user.getDisplayName().toLowerCase().contains(query.toLowerCase()))
                .toList();

        return users.stream()
                .map(UserManagementDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Promote user to admin
     */
    @Transactional
    public UserManagementDto promoteToAdmin(Long userId) {
        log.info("Promoting user {} to admin", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Set<RoleName> roles = new HashSet<>(user.getRoles());
        roles.add(RoleName.ADMIN);
        user.setRoles(roles);
        
        User updated = userRepository.save(user);
        
        log.info("Successfully promoted user {} to admin", userId);
        return UserManagementDto.fromEntity(updated);
    }

    /**
     * Demote admin to user
     */
    @Transactional
    public UserManagementDto demoteFromAdmin(Long userId) {
        log.info("Demoting user {} from admin", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Set<RoleName> roles = new HashSet<>(user.getRoles());
        roles.remove(RoleName.ADMIN);
        if (roles.isEmpty()) {
            roles.add(RoleName.USER);
        }
        user.setRoles(roles);
        
        User updated = userRepository.save(user);
        
        log.info("Successfully demoted user {} from admin", userId);
        return UserManagementDto.fromEntity(updated);
    }
}
