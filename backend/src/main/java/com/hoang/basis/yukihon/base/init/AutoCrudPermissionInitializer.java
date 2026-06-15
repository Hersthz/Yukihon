package com.hoang.basis.yukihon.base.init;

import com.hoang.basis.yukihon.base.crud.registry.AutoCrudRegistry;
import com.hoang.basis.yukihon.base.crud.registry.CrudDescriptor;
import com.hoang.basis.yukihon.system.user.entity.Permission;
import com.hoang.basis.yukihon.system.user.entity.RoleName;
import com.hoang.basis.yukihon.system.user.entity.RolePermission;
import com.hoang.basis.yukihon.system.user.repository.PermissionRepository;
import com.hoang.basis.yukihon.system.user.repository.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Seeds {@code <PREFIX>_CREATE/READ/UPDATE/DELETE} permissions for every auto-CRUD entity that
 * declares {@code @ResourcePermission}, and grants them to ADMIN. Idempotent; runs on every boot
 * independently of the demo data seeder ({@code app.seed.enabled}).
 */
@Component
@Order(5)
@RequiredArgsConstructor
@Slf4j
public class AutoCrudPermissionInitializer implements CommandLineRunner {

    private static final List<String> ACTIONS = List.of("CREATE", "READ", "UPDATE", "DELETE");

    private final AutoCrudRegistry registry;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    @Override
    @Transactional
    public void run(String... args) {
        int created = 0;
        for (CrudDescriptor descriptor : registry.all()) {
            String prefix = descriptor.getPermissionPrefix();
            if (prefix == null || prefix.isBlank()) {
                continue;
            }
            for (String action : ACTIONS) {
                String code = prefix + "_" + action;
                Permission permission = ensurePermission(code,
                        descriptor.getLabel() + " - " + action,
                        action + " access for " + descriptor.getLabel());
                if (ensureRolePermission(RoleName.ADMIN, permission)) {
                    created++;
                }
            }
        }
        if (created > 0) {
            log.info("AutoCrud: seeded {} new ADMIN permission grant(s)", created);
        }
    }

    private Permission ensurePermission(String code, String name, String description) {
        return permissionRepository.findByCode(code)
                .orElseGet(() -> permissionRepository.save(Permission.builder()
                        .code(code)
                        .name(name)
                        .description(description)
                        .build()));
    }

    private boolean ensureRolePermission(RoleName role, Permission permission) {
        if (rolePermissionRepository.existsByRoleAndPermission(role, permission)) {
            return false;
        }
        rolePermissionRepository.save(RolePermission.builder()
                .role(role)
                .permission(permission)
                .build());
        return true;
    }
}
