package com.hoang.basis.yukihon.security;

import com.hoang.basis.yukihon.system.user.entity.User;
import com.hoang.basis.yukihon.system.user.entity.RoleName;
import com.hoang.basis.yukihon.system.user.repository.RolePermissionRepository;
import com.hoang.basis.yukihon.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
        private final RolePermissionRepository rolePermissionRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username.toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Set<String> authorityCodes = new LinkedHashSet<>();

        user.getRoles().forEach(role -> authorityCodes.add("ROLE_" + role.name()));

        authorityCodes.addAll(rolePermissionRepository.findPermissionCodesByRoles(user.getRoles()));

        // Backward-compatible fallback so old data without seeded permissions still works.
        if (user.getRoles().contains(RoleName.USER)) {
            authorityCodes.add("USER_READ_PROFILE");
            authorityCodes.add("USER_UPDATE_PROFILE");
            authorityCodes.add("CONTENT_READ");
            authorityCodes.add("COMMUNITY_INTERACT");
            authorityCodes.add("TRANSLATION_USE");
        }
        if (user.getRoles().contains(RoleName.ADMIN)) {
            authorityCodes.add("USER_READ_PROFILE");
            authorityCodes.add("USER_UPDATE_PROFILE");
            authorityCodes.add("CONTENT_READ");
            authorityCodes.add("CONTENT_MANAGE");
            authorityCodes.add("COMMUNITY_INTERACT");
            authorityCodes.add("TRANSLATION_USE");
            authorityCodes.add("ADMIN_DASHBOARD_READ");
            authorityCodes.add("ADMIN_USERS_MANAGE");
            authorityCodes.add("ADMIN_ROLES_MANAGE");
        }

        List<SimpleGrantedAuthority> authorities = authorityCodes.stream()
                .map(SimpleGrantedAuthority::new)
                .toList();

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.isEnabled(),
                true,
                true,
                true,
                authorities
        );
    }
}
