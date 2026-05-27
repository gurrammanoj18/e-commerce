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
                alter table if exists users
                add column if not exists preferred_delivery_mode varchar(50)
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
                alter table if exists orders
                add column if not exists delivery_mode varchar(50)
                """);
        jdbcTemplate.execute("""
                update orders
                set delivery_mode = case
                    when coalesce(shipping_cost, 0) = 0 and city = 'Store pickup' then 'STORE_PICKUP'
                    else 'HOME_DELIVERY'
                end
                where delivery_mode is null
                """);
        jdbcTemplate.execute("""
                alter table if exists orders
                alter column delivery_mode set not null
                """);
        jdbcTemplate.execute("""
                alter table if exists orders
                add column if not exists user_address_id bigint
                """);
        jdbcTemplate.execute("""
                alter table if exists orders
                add column if not exists delivery_slot varchar(100)
                """);
        jdbcTemplate.execute("""
                alter table if exists orders
                add column if not exists priority_order boolean not null default false
                """);
        jdbcTemplate.execute("""
                alter table if exists orders
                add column if not exists priority_notes varchar(1000)
                """);
        jdbcTemplate.execute("""
                alter table if exists product
                drop column if exists specifications
                """);
        jdbcTemplate.execute("""
                alter table if exists category
                add column if not exists image text
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
        jdbcTemplate.execute("""
                create table if not exists user_address (
                    id bigserial primary key,
                    user_id bigint not null references users(id),
                    label varchar(255) not null,
                    recipient_name varchar(255) not null,
                    phone varchar(50) not null,
                    street_address varchar(1000) not null,
                    city varchar(255) not null,
                    postal_code varchar(100) not null,
                    default_address boolean not null default false,
                    created_at timestamp not null,
                    updated_at timestamp not null
                )
                """);
        jdbcTemplate.execute("""
                create table if not exists saved_for_later_item (
                    id bigserial primary key,
                    user_id bigint not null references users(id),
                    product_id bigint not null references product(id),
                    quantity integer not null,
                    created_at timestamp not null
                )
                """);
        jdbcTemplate.execute("""
                create table if not exists banner (
                    id bigserial primary key,
                    title varchar(255) not null,
                    subtitle varchar(1000),
                    image_url varchar(2000) not null,
                    cta_label varchar(255),
                    cta_href varchar(255),
                    display_order integer not null,
                    active boolean not null default true,
                    created_at timestamp not null,
                    updated_at timestamp not null
                )
                """);
        jdbcTemplate.execute("""
                alter table if exists bulk_order_inquiry
                add column if not exists delivery_city varchar(255)
                """);
        jdbcTemplate.execute("""
                alter table if exists bulk_order_inquiry
                add column if not exists budget_amount numeric(12,2)
                """);
        jdbcTemplate.execute("""
                alter table if exists bulk_order_inquiry
                add column if not exists rfq_required boolean not null default false
                """);
        jdbcTemplate.execute("""
                alter table if exists bulk_order_inquiry
                add column if not exists priority_request boolean not null default false
                """);
        jdbcTemplate.execute("""
                alter table if exists bulk_order_inquiry
                add column if not exists estimated_total numeric(12,2)
                """);
        jdbcTemplate.execute("""
                alter table if exists bulk_order_inquiry
                add column if not exists quote_status varchar(50) not null default 'NEW'
                """);
        jdbcTemplate.execute("""
                alter table if exists bulk_order_inquiry
                add column if not exists admin_notes varchar(2000)
                """);
        jdbcTemplate.execute("""
                create table if not exists bulk_order_inquiry_line_item (
                    id bigserial primary key,
                    inquiry_id bigint not null references bulk_order_inquiry(id),
                    product_id bigint references product(id),
                    product_name varchar(255) not null,
                    requested_quantity integer not null,
                    unit_price numeric(12,2) not null,
                    discount_percentage integer not null,
                    estimated_line_total numeric(12,2) not null
                )
                """);
    }
}
