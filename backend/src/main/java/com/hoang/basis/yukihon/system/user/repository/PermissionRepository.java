package com.hoang.basis.yukihon.system.user.repository;

import com.hoang.basis.yukihon.system.user.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PermissionRepository extends JpaRepository<Permission, Long> {

    Optional<Permission> findByCode(String code);

    boolean existsByCode(String code);
}
