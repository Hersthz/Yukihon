package com.hoang.basis.yukihon.system.user.repository;

import com.hoang.basis.yukihon.system.user.entity.RoleName;
import com.hoang.basis.yukihon.system.user.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPasswordResetTokenHash(String passwordResetTokenHash);

    boolean existsByEmail(String email);

    long countByEnabled(boolean enabled);

    @Query("SELECT COUNT(DISTINCT u) FROM User u JOIN u.roles r WHERE r = :role")
    long countUsersByRole(@Param("role") RoleName role);

    List<User> findTop100ByEmailContainingIgnoreCaseOrDisplayNameContainingIgnoreCaseOrderByCreatedAtDesc(
            String email, String displayName);

    /** Search enabled users by display name or email (excludes the caller), for friend lookup. */
    @Query("SELECT u FROM User u WHERE u.enabled = true AND u.id <> :selfId "
            + "AND (LOWER(u.displayName) LIKE LOWER(CONCAT('%', :q, '%')) "
            + "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%'))) ORDER BY u.displayName ASC")
    List<User> searchForFriends(@Param("q") String q, @Param("selfId") Long selfId, Pageable pageable);
}
