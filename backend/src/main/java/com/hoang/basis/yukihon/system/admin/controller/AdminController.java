package com.hoang.basis.yukihon.system.admin.controller;

import com.hoang.basis.yukihon.system.admin.dto.SystemStatsDto;
import com.hoang.basis.yukihon.system.admin.dto.UpdateUserRolesRequest;
import com.hoang.basis.yukihon.system.admin.dto.UpdateUserStatusRequest;
import com.hoang.basis.yukihon.system.admin.dto.UserManagementDto;
import com.hoang.basis.yukihon.system.admin.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class AdminController {

    private final AdminService adminService;

    /**
     * Get all users with pagination
     */
    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ADMIN_USERS_MANAGE')")
    public ResponseEntity<Page<UserManagementDto>> getAllUsers(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        log.info("Admin request: Get all users");
        return ResponseEntity.ok(adminService.getAllUsers(pageable));
    }

    /**
     * Get user by ID
     */
    @GetMapping("/users/{userId}")
    @PreAuthorize("hasAuthority('ADMIN_USERS_MANAGE')")
    public ResponseEntity<UserManagementDto> getUserById(@PathVariable Long userId) {
        log.info("Admin request: Get user by id: {}", userId);
        return ResponseEntity.ok(adminService.getUserById(userId));
    }

    /**
     * Search users
     */
    @GetMapping("/users/search")
    @PreAuthorize("hasAuthority('ADMIN_USERS_MANAGE')")
    public ResponseEntity<List<UserManagementDto>> searchUsers(@RequestParam String query) {
        log.info("Admin request: Search users with query: {}", query);
        return ResponseEntity.ok(adminService.searchUsers(query));
    }

    /**
     * Update user roles
     */
    @PutMapping("/users/{userId}/roles")
    @PreAuthorize("hasAuthority('ADMIN_ROLES_MANAGE')")
    public ResponseEntity<UserManagementDto> updateUserRoles(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRolesRequest request
    ) {
        log.info("Admin request: Update roles for user {}", userId);
        return ResponseEntity.ok(adminService.updateUserRoles(userId, request));
    }

    /**
     * Update user status (enable/disable)
     */
    @PutMapping("/users/{userId}/status")
    @PreAuthorize("hasAuthority('ADMIN_USERS_MANAGE')")
    public ResponseEntity<UserManagementDto> updateUserStatus(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserStatusRequest request
    ) {
        log.info("Admin request: Update status for user {}", userId);
        return ResponseEntity.ok(adminService.updateUserStatus(userId, request));
    }

    /**
     * Promote user to admin
     */
    @PostMapping("/users/{userId}/promote")
    @PreAuthorize("hasAuthority('ADMIN_ROLES_MANAGE')")
    public ResponseEntity<UserManagementDto> promoteToAdmin(@PathVariable Long userId) {
        log.info("Admin request: Promote user {} to admin", userId);
        return ResponseEntity.ok(adminService.promoteToAdmin(userId));
    }

    /**
     * Demote admin to user
     */
    @PostMapping("/users/{userId}/demote")
    @PreAuthorize("hasAuthority('ADMIN_ROLES_MANAGE')")
    public ResponseEntity<UserManagementDto> demoteFromAdmin(@PathVariable Long userId) {
        log.info("Admin request: Demote user {} from admin", userId);
        return ResponseEntity.ok(adminService.demoteFromAdmin(userId));
    }

    /**
     * Delete user (soft delete)
     */
    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasAuthority('ADMIN_USERS_MANAGE')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        log.info("Admin request: Delete user {}", userId);
        adminService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get system statistics
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('ADMIN_DASHBOARD_READ')")
    public ResponseEntity<SystemStatsDto> getSystemStats() {
        log.info("Admin request: Get system statistics");
        return ResponseEntity.ok(adminService.getSystemStats());
    }
}
