package com.voltmart.ecommerce.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RequestRateLimitingFilter extends OncePerRequestFilter {

    private static final Map<String, RateLimitRule> RULES = Map.of(
            "/api/auth/otp/request", new RateLimitRule(5, Duration.ofMinutes(10)),
            "/api/auth/otp/verify", new RateLimitRule(10, Duration.ofMinutes(10)),
            "/api/auth/google", new RateLimitRule(20, Duration.ofMinutes(10)),
            "/api/auth/admin/login", new RateLimitRule(10, Duration.ofMinutes(10)),
            "/api/support/bulk-order", new RateLimitRule(10, Duration.ofHours(1)),
            "/api/services/requests", new RateLimitRule(10, Duration.ofHours(1)),
            "/api/orders/checkout", new RateLimitRule(20, Duration.ofHours(1))
    );

    private final Map<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return RULES.keySet().stream().noneMatch(request.getRequestURI()::startsWith);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String path = RULES.keySet().stream()
                .filter(request.getRequestURI()::startsWith)
                .findFirst()
                .orElse(null);

        if (path == null) {
            filterChain.doFilter(request, response);
            return;
        }

        RateLimitRule rule = RULES.get(path);
        String key = request.getRemoteAddr() + ":" + path;
        TokenBucket bucket = buckets.computeIfAbsent(key, ignored -> new TokenBucket(rule.limit(), rule.window()));
        boolean allowed = bucket.tryConsume();
        response.setHeader("X-RateLimit-Limit", String.valueOf(rule.limit()));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(bucket.remaining()));

        if (!allowed) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Too many requests. Please try again shortly.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private record RateLimitRule(int limit, Duration window) {
    }

    private static final class TokenBucket {
        private final int capacity;
        private final long refillMillis;
        private double tokens;
        private long lastRefillAt;

        private TokenBucket(int capacity, Duration window) {
            this.capacity = capacity;
            this.refillMillis = Math.max(1, window.toMillis() / Math.max(1, capacity));
            this.tokens = capacity;
            this.lastRefillAt = Instant.now().toEpochMilli();
        }

        synchronized boolean tryConsume() {
            refill();
            if (tokens < 1d) {
                return false;
            }
            tokens -= 1d;
            return true;
        }

        synchronized int remaining() {
            refill();
            return (int) Math.floor(tokens);
        }

        private void refill() {
            long now = Instant.now().toEpochMilli();
            long elapsed = now - lastRefillAt;
            if (elapsed <= 0) {
                return;
            }
            double refill = (double) elapsed / refillMillis;
            if (refill > 0d) {
                tokens = Math.min(capacity, tokens + refill);
                lastRefillAt = now;
            }
        }
    }
}
