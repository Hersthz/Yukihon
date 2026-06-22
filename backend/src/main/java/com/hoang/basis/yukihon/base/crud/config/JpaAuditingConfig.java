package com.hoang.basis.yukihon.base.crud.config;

import java.util.Optional;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Enables Spring Data JPA auditing so {@link com.hoang.basis.yukihon.base.crud.domain.BaseEntity}
 * audit columns are populated automatically. The auditor is the current authenticated principal's
 * username (email), or {@code "system"} for unauthenticated / bootstrap writes.
 */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class JpaAuditingConfig {

    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null
                    || !authentication.isAuthenticated()
                    || "anonymousUser".equals(authentication.getPrincipal())) {
                return Optional.of("system");
            }
            return Optional.ofNullable(authentication.getName());
        };
    }
}
