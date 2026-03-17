package com.hoang.basis.yukihon.system.admin.dto;

import com.hoang.basis.yukihon.system.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserManagementDto {

    private Long id;
    private String email;
    private String displayName;
    private boolean enabled;
    private Set<String> roles;
    private Instant createdAt;
    private Instant updatedAt;

    public static UserManagementDto fromEntity(User user) {
        return UserManagementDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .enabled(user.isEnabled())
                .roles(user.getRoles()
                        .stream()
                        .map(Enum::name)
                        .collect(Collectors.toSet()))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
