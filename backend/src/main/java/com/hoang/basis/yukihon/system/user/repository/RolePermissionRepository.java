package com.hoang.basis.yukihon.system.user.repository;

import com.hoang.basis.yukihon.system.user.entity.Permission;
import com.hoang.basis.yukihon.system.user.entity.RoleName;
import com.hoang.basis.yukihon.system.user.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {

    boolean existsByRoleAndPermission(RoleName role, Permission permission);

    long countByRole(RoleName role);
}
