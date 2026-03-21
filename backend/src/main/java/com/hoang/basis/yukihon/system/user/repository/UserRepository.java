package com.hoang.basis.yukihon.system.user.repository;

import com.hoang.basis.yukihon.system.user.entity.RoleName;
import com.hoang.basis.yukihon.system.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByEnabled(boolean enabled);

    @Query("SELECT COUNT(DISTINCT u) FROM User u JOIN u.roles r WHERE r = :role")
    long countUsersByRole(@Param("role") RoleName role);

    List<User> findTop100ByEmailContainingIgnoreCaseOrDisplayNameContainingIgnoreCaseOrderByCreatedAtDesc(
            String email,
            String displayName
    );
}
