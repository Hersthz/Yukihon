package com.hoang.basis.yukihon.base.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

/** Unit tests for the per-IP token-bucket {@link RateLimitFilter} (no Spring context / DB needed). */
class RateLimitFilterTest {

    private RateLimitProperties props;
    private RateLimitFilter filter;

    @BeforeEach
    void setUp() {
        props = new RateLimitProperties(); // enabled, auth=10/min, ai=30/min
        filter = new RateLimitFilter(props, new ObjectMapper());
    }

    /** A FilterChain that records whether the request was allowed through. */
    private static final class CountingChain implements FilterChain {
        int passed = 0;

        @Override
        public void doFilter(jakarta.servlet.ServletRequest req, jakarta.servlet.ServletResponse res) {
            passed++;
        }
    }

    private MockHttpServletResponse call(String method, String path, String ip) throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest(method, path);
        req.setRemoteAddr(ip);
        MockHttpServletResponse res = new MockHttpServletResponse();
        filter.doFilter(req, res, new CountingChain());
        return res;
    }

    @Test
    @DisplayName("auth: allows up to capacity, then blocks with 429 + Retry-After")
    void authBlocksOverCapacity() throws Exception {
        for (int i = 0; i < props.getAuthCapacityPerMinute(); i++) {
            assertThat(call("POST", "/api/auth/login", "10.0.0.1").getStatus()).isEqualTo(200);
        }
        MockHttpServletResponse blocked = call("POST", "/api/auth/login", "10.0.0.1");
        assertThat(blocked.getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS.value());
        assertThat(blocked.getHeader("Retry-After")).isEqualTo("60");
        assertThat(blocked.getContentAsString()).contains("Too Many Requests");
    }

    @Test
    @DisplayName("buckets are per-IP: one IP hitting the limit doesn't affect another")
    void bucketsArePerIp() throws Exception {
        for (int i = 0; i < props.getAuthCapacityPerMinute() + 2; i++) {
            call("POST", "/api/auth/login", "1.1.1.1");
        }
        // a different IP still gets through
        assertThat(call("POST", "/api/auth/login", "2.2.2.2").getStatus()).isEqualTo(200);
    }

    @Test
    @DisplayName("auth and ai groups have independent budgets")
    void groupsAreIndependent() throws Exception {
        // exhaust auth
        for (int i = 0; i < props.getAuthCapacityPerMinute() + 1; i++) {
            call("POST", "/api/auth/login", "3.3.3.3");
        }
        // ai bucket for the same IP is untouched
        assertThat(call("POST", "/api/ai-chat/respond", "3.3.3.3").getStatus()).isEqualTo(200);
        assertThat(call("POST", "/api/translation/translate", "3.3.3.3").getStatus())
                .isEqualTo(200);
    }

    @Test
    @DisplayName("non-limited paths always pass through")
    void unlimitedPathsPass() throws Exception {
        CountingChain chain = new CountingChain();
        for (int i = 0; i < 50; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/decks/mine");
            req.setRemoteAddr("9.9.9.9");
            filter.doFilter(req, new MockHttpServletResponse(), chain);
        }
        assertThat(chain.passed).isEqualTo(50);
    }

    @Test
    @DisplayName("disabled flag bypasses limiting entirely")
    void disabledBypasses() throws Exception {
        props.setEnabled(false);
        for (int i = 0; i < props.getAuthCapacityPerMinute() + 5; i++) {
            assertThat(call("POST", "/api/auth/login", "8.8.8.8").getStatus()).isEqualTo(200);
        }
    }
}
