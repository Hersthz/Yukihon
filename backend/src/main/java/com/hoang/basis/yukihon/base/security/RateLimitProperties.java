package com.hoang.basis.yukihon.base.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/** Per-IP rate-limit settings (requests per minute), bound from {@code app.rate-limit.*}. */
@Component
@ConfigurationProperties(prefix = "app.rate-limit")
@Getter
@Setter
public class RateLimitProperties {

    /** Master switch. */
    private boolean enabled = true;

    /** Limit for auth endpoints (login/register/forgot/reset/google) — brute-force protection. */
    private int authCapacityPerMinute = 10;

    /** Limit for expensive endpoints (AI chat, translation) — abuse/cost protection. */
    private int aiCapacityPerMinute = 30;
}
