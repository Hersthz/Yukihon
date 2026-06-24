package com.hoang.basis.yukihon.base.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Per-IP token-bucket rate limiting for two endpoint groups: {@code auth} (login/register/reset —
 * brute-force protection) and {@code ai} (AI chat + translation — cost/abuse protection). Other
 * paths pass through untouched. Over-limit requests get 429 with a Retry-After header.
 *
 * <p>Buckets are held in an in-process map keyed by {@code ip:group} — fine for a single instance;
 * a multi-instance deployment would back this with Redis (bucket4j supports it).
 */
public class RateLimitFilter extends OncePerRequestFilter {

    private static final String GROUP_AUTH = "auth";
    private static final String GROUP_AI = "ai";

    private final RateLimitProperties props;
    private final ObjectMapper objectMapper;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public RateLimitFilter(RateLimitProperties props, ObjectMapper objectMapper) {
        this.props = props;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String group = props.isEnabled() ? classify(request.getRequestURI()) : null;
        if (group == null) {
            chain.doFilter(request, response);
            return;
        }

        Bucket bucket = buckets.computeIfAbsent(clientIp(request) + ":" + group, key -> newBucket(group));
        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            writeTooManyRequests(request, response);
        }
    }

    /** Returns the rate-limit group for a path, or null if the path is not limited. */
    private String classify(String path) {
        if (path.startsWith("/api/auth/login")
                || path.startsWith("/api/auth/register")
                || path.startsWith("/api/auth/forgot-password")
                || path.startsWith("/api/auth/reset-password")
                || path.startsWith("/api/auth/google")) {
            return GROUP_AUTH;
        }
        if (path.startsWith("/api/ai-chat/respond") || path.equals("/api/translation/translate")) {
            return GROUP_AI;
        }
        return null;
    }

    private Bucket newBucket(String group) {
        int capacity = GROUP_AUTH.equals(group) ? props.getAuthCapacityPerMinute() : props.getAiCapacityPerMinute();
        Bandwidth limit = Bandwidth.builder()
                .capacity(capacity)
                .refillGreedy(capacity, Duration.ofMinutes(1))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    /** Prefer the proxy-supplied client IP (nginx sets X-Forwarded-For), else the socket address. */
    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void writeTooManyRequests(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader("Retry-After", "60");
        Map<String, Object> body = Map.of(
                "status",
                429,
                "error",
                "Too Many Requests",
                "message",
                "Rate limit exceeded. Please slow down and try again shortly.",
                "path",
                request.getRequestURI());
        objectMapper.writeValue(response.getWriter(), body);
    }
}
