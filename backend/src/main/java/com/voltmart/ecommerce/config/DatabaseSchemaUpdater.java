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
                alter table if exists users
                add column if not exists phone_number varchar(20)
                """);
        jdbcTemplate.execute("""
                alter table if exists users
                alter column email drop not null
                """);
        jdbcTemplate.execute("""
                alter table if exists users
                alter column password drop not null
                """);
        jdbcTemplate.execute("""
                update users
                set email = null,
                    password = null
                where role = 'ROLE_CUSTOMER'
                """);
        jdbcTemplate.execute("""
                update users
                set full_name = concat('Customer ', right(phone_number, 4))
                where role = 'ROLE_CUSTOMER'
                  and phone_number is not null
                  and (full_name is null or trim(full_name) = '' or full_name = 'Demo Customer')
                """);
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
        jdbcTemplate.execute("""
                create table if not exists login_otp (
                    id bigserial primary key,
                    email varchar(255) not null,
                    otp_code varchar(6) not null,
                    expires_at timestamp not null,
                    consumed_at timestamp null,
                    created_at timestamp not null
                )
                """);
        jdbcTemplate.execute("""
                alter table if exists login_otp
                add column if not exists email varchar(255)
                """);
        jdbcTemplate.execute("""
                alter table if exists login_otp
                add column if not exists otp_code varchar(6)
                """);
        jdbcTemplate.execute("""
                alter table if exists login_otp
                drop column if exists phone_number
                """);
        jdbcTemplate.execute("""
                alter table if exists login_otp
                drop column if exists request_id
                """);
    }
}
