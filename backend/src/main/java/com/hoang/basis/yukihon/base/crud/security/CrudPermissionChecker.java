package com.hoang.basis.yukihon.base.crud.security;

import com.hoang.basis.yukihon.base.crud.registry.CrudDescriptor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

/**
 * Enforces {@code <prefix>_<ACTION>} authorities for auto-CRUD resources that declare a
 * {@code @ResourcePermission}. {@code ROLE_ADMIN} bypasses all checks. Resources without a
 * permission prefix rely on the global "authenticated" rule in SecurityConfig.
 */
@Component
public class CrudPermissionChecker {

    public enum Action {CREATE, READ, UPDATE, DELETE}

    public void check(CrudDescriptor descriptor, Action action) {
        String prefix = descriptor.getPermissionPrefix();
        if (prefix == null || prefix.isBlank()) {
            return;
        }

        Set<String> authorities = currentAuthorities();
        if (authorities.contains("ROLE_ADMIN")) {
            return;
        }

        String required = prefix + "_" + action.name();
        if (!authorities.contains(required)) {
            throw new AccessDeniedException("Missing permission: " + required);
        }
    }

    private Set<String> currentAuthorities() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return Set.of();
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());
    }
}
