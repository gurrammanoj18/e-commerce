package com.voltmart.ecommerce.controller;

import java.time.Instant;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/health", "/health"})
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        String database = "up";

        try {
            jdbcTemplate.queryForObject("select 1", Integer.class);
        } catch (RuntimeException exception) {
            database = "down";
        }

        return ResponseEntity.ok(Map.of(
                "status", "up",
                "database", database,
                "timestamp", Instant.now().toString()
        ));
    }
}
