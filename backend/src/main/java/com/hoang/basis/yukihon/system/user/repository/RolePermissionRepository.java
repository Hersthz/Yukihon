package com.hoang.basis.yukihon.system.user.repository;

import com.hoang.basis.yukihon.system.user.entity.Permission;
import com.hoang.basis.yukihon.system.user.entity.RoleName;
import com.hoang.basis.yukihon.system.user.entity.RolePermission;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {

    boolean existsByRoleAndPermission(RoleName role, Permission permission);

    long countByRole(RoleName role);

    @Query("SELECT DISTINCT rp.permission.code FROM RolePermission rp WHERE rp.role IN :roles")
    List<String> findPermissionCodesByRoles(@Param("roles") Set<RoleName> roles);
}
