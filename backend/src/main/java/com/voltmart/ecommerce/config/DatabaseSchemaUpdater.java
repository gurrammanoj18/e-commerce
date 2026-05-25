package com.voltmart.ecommerce.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(0)
@RequiredArgsConstructor
public class DatabaseSchemaUpdater implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        jdbcTemplate.execute("""
                alter table if exists product
                add column if not exists warranty_available boolean not null default true
                """);
        jdbcTemplate.execute("""
                alter table if exists product
                add column if not exists replacement_available boolean not null default true
                """);
        jdbcTemplate.execute("""
                create table if not exists wishlist (
                    id bigserial primary key,
                    user_id bigint not null unique references users(id)
                )
                """);
        jdbcTemplate.execute("""
                create table if not exists wishlist_item (
                    id bigserial primary key,
                    wishlist_id bigint not null references wishlist(id),
                    product_id bigint not null references product(id),
                    created_at timestamp not null
                )
                """);
    }
}
