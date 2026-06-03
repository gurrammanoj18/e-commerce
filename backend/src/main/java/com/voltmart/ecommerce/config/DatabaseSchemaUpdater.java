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
                add column if not exists profile_image_url text
                """);
        jdbcTemplate.execute("""
                alter table if exists users
                alter column profile_image_url type text
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
                alter table if exists users
                add column if not exists wallet_balance numeric(12,2) not null default 0
                """);
        jdbcTemplate.execute("""
                update users
                set wallet_balance = 0
                where wallet_balance is null
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
                alter table if exists product_images
                alter column image_url type text
                """);
        jdbcTemplate.execute("""
                alter table if exists orders
                add column if not exists delivery_mode varchar(50)
                """);
        jdbcTemplate.execute("""
                update orders
                set status = 'CONFIRMED'
                where status = 'PENDING'
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
                alter table if exists orders
                add column if not exists applied_coupon_code varchar(100)
                """);
        jdbcTemplate.execute("""
                alter table if exists orders
                add column if not exists applied_discount_amount numeric(12,2) default 0
                """);
        jdbcTemplate.execute("""
                alter table if exists orders
                add column if not exists wallet_credit_amount numeric(12,2)
                """);
        jdbcTemplate.execute("""
                alter table if exists orders
                add column if not exists wallet_credit_eligible_at timestamp
                """);
        jdbcTemplate.execute("""
                alter table if exists orders
                add column if not exists wallet_credit_processed boolean not null default false
                """);
        jdbcTemplate.execute("""
                alter table if exists orders
                add column if not exists wallet_debit_amount numeric(12,2) default 0
                """);
        jdbcTemplate.execute("""
                update orders
                set wallet_debit_amount = 0
                where wallet_debit_amount is null
                """);
        jdbcTemplate.execute("""
                alter table if exists orders
                alter column wallet_debit_amount set not null
                """);
        jdbcTemplate.execute("""
                update orders
                set applied_discount_amount = 0
                where applied_discount_amount is null
                """);
        jdbcTemplate.execute("""
                alter table if exists orders
                alter column applied_discount_amount set not null
                """);
        jdbcTemplate.execute("""
                update orders
                set wallet_credit_processed = false
                where wallet_credit_processed is null
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
                alter table if exists category
                alter column image type text using image::text
                """);
        jdbcTemplate.execute("""
                alter table if exists category
                alter column image drop not null
                """);
        jdbcTemplate.execute("""
                alter table if exists category
                add column if not exists show_in_navbar boolean not null default false
                """);
        jdbcTemplate.execute("""
                update category
                set image = null
                where show_in_navbar = true
                """);
        jdbcTemplate.execute("""
                update category
                set show_in_navbar = false
                where show_in_navbar is null
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
        jdbcTemplate.execute("drop table if exists login_otp");
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
                    image_url text not null
                )
                """);
        jdbcTemplate.execute("""
                alter table if exists banner
                add column if not exists image_url text
                """);
        jdbcTemplate.execute("""
                alter table if exists banner
                alter column image_url type text
                """);
        jdbcTemplate.execute("""
                alter table if exists banner
                drop column if exists title
                """);
        jdbcTemplate.execute("""
                alter table if exists banner
                drop column if exists subtitle
                """);
        jdbcTemplate.execute("""
                alter table if exists banner
                drop column if exists cta_label
                """);
        jdbcTemplate.execute("""
                alter table if exists banner
                drop column if exists cta_href
                """);
        jdbcTemplate.execute("""
                alter table if exists banner
                drop column if exists type
                """);
        jdbcTemplate.execute("""
                alter table if exists banner
                drop column if exists display_order
                """);
        jdbcTemplate.execute("""
                alter table if exists banner
                drop column if exists active
                """);
        jdbcTemplate.execute("""
                alter table if exists banner
                drop column if exists created_at
                """);
        jdbcTemplate.execute("""
                alter table if exists banner
                drop column if exists updated_at
                """);
        jdbcTemplate.execute("""
                create table if not exists brand_logo (
                    id bigserial primary key,
                    brand_name varchar(255) not null unique,
                    logo_url text not null,
                    display_order integer not null default 0,
                    active boolean not null default true
                )
                """);
        jdbcTemplate.execute("""
                alter table if exists brand_logo
                add column if not exists brand_name varchar(255)
                """);
        jdbcTemplate.execute("""
                alter table if exists brand_logo
                add column if not exists logo_url text
                """);
        jdbcTemplate.execute("""
                alter table if exists brand_logo
                add column if not exists display_order integer not null default 0
                """);
        jdbcTemplate.execute("""
                alter table if exists brand_logo
                add column if not exists active boolean not null default true
                """);
        jdbcTemplate.execute("drop table if exists homepage_section cascade");
        jdbcTemplate.execute("""
                create table if not exists wallet_coupon (
                    id bigserial primary key,
                    code varchar(255) not null unique,
                    type varchar(50) not null check (type in ('WALLET_TOPUP', 'ORDER_CASHBACK', 'ORDER_DISCOUNT')),
                    amount numeric(12,2) not null,
                    discount_percentage integer not null default 0,
                    description varchar(500),
                    assigned_customer_emails varchar(2000),
                    active boolean not null default true,
                    reward_delay_minutes integer not null default 60,
                    redemption_frequency varchar(50) not null default 'ONCE',
                    created_at timestamp not null,
                    updated_at timestamp not null
                )
                """);
        jdbcTemplate.execute("""
                alter table if exists wallet_coupon
                drop constraint if exists wallet_coupon_type_check
                """);
        jdbcTemplate.execute("""
                alter table if exists wallet_coupon
                add constraint wallet_coupon_type_check
                check (type in ('WALLET_TOPUP', 'ORDER_CASHBACK', 'ORDER_DISCOUNT'))
                """);
        jdbcTemplate.execute("""
                alter table if exists wallet_coupon
                add column if not exists deleted boolean
                """);
        jdbcTemplate.execute("""
                update wallet_coupon
                set deleted = false
                where deleted is null
                """);
        jdbcTemplate.execute("""
                alter table if exists wallet_coupon
                alter column deleted set default false
                """);
        jdbcTemplate.execute("""
                alter table if exists wallet_coupon
                alter column deleted set not null
                """);
        jdbcTemplate.execute("""
                alter table if exists wallet_coupon
                add column if not exists assigned_customer_emails varchar(2000)
                """);
        jdbcTemplate.execute("""
                alter table if exists wallet_coupon
                add column if not exists discount_percentage integer not null default 0
                """);
        jdbcTemplate.execute("""
                update wallet_coupon
                set discount_percentage = 0
                where discount_percentage is null
                """);
        jdbcTemplate.execute("""
                alter table if exists wallet_coupon
                alter column discount_percentage set not null
                """);
        jdbcTemplate.execute("""
                update wallet_coupon
                set amount = 0
                where type = 'ORDER_DISCOUNT'
                """);
        jdbcTemplate.execute("""
                alter table if exists wallet_coupon
                add column if not exists redemption_frequency varchar(50) not null default 'ONCE'
                """);
        jdbcTemplate.execute("""
                create table if not exists wallet_transaction (
                    id bigserial primary key,
                    user_id bigint not null references users(id),
                    type varchar(50) not null,
                    amount numeric(12,2) not null,
                    description varchar(500) not null,
                    reference_code varchar(100),
                    created_at timestamp not null
                )
                """);
        jdbcTemplate.execute("""
                create table if not exists wallet_coupon_redemption (
                    id bigserial primary key,
                    wallet_coupon_id bigint not null references wallet_coupon(id),
                    user_id bigint not null references users(id),
                    allowed_redemptions integer not null default 1,
                    redeemed_count integer not null default 0,
                    last_redeemed_at timestamp,
                    created_at timestamp not null,
                    updated_at timestamp not null,
                    unique(wallet_coupon_id, user_id)
                )
                """);
        jdbcTemplate.execute("""
                alter table if exists wallet_coupon_redemption
                add column if not exists allowed_redemptions integer not null default 1
                """);
        jdbcTemplate.execute("""
                alter table if exists wallet_coupon_redemption
                add column if not exists redeemed_count integer not null default 0
                """);
        jdbcTemplate.execute("""
                alter table if exists wallet_coupon_redemption
                add column if not exists last_redeemed_at timestamp
                """);
        jdbcTemplate.execute("""
                create table if not exists service_request (
                    id bigserial primary key,
                    user_id bigint references users(id),
                    service_key varchar(255) not null,
                    service_name varchar(255) not null,
                    customer_name varchar(255) not null,
                    phone_number varchar(50) not null,
                    address varchar(1000) not null,
                    postal_code varchar(100) not null,
                    description varchar(2000) not null,
                    problem_images text,
                    created_at timestamp not null
                )
                """);
        jdbcTemplate.execute("""
                create table if not exists serviceable_pincode (
                    id bigserial primary key,
                    pincode varchar(20) not null unique,
                    label varchar(255),
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
        jdbcTemplate.execute("""
                alter table if exists return_requests
                add column if not exists request_type varchar(50)
                """);
        jdbcTemplate.execute("""
                alter table if exists return_requests
                add column if not exists initiated_by_admin boolean not null default false
                """);
        jdbcTemplate.execute("""
                update return_requests
                set request_type = coalesce(request_type, 'RETURN')
                """);
        jdbcTemplate.execute("""
                alter table if exists return_requests
                alter column request_type set not null
                """);
        jdbcTemplate.execute("""
                alter table if exists return_requests
                add column if not exists refunded_at timestamp
                """);
        jdbcTemplate.execute("""
                alter table if exists return_requests
                add column if not exists refund_processed boolean not null default false
                """);
        jdbcTemplate.execute("""
                update return_requests
                set refund_processed = false
                where refund_processed is null
                """);
        jdbcTemplate.execute("""
                update return_requests
                set status = case
                    when request_type = 'REPLACEMENT' and status in ('REQUESTED', 'APPROVED', 'CLOSED') then 'UNDER_REVIEW'
                    when request_type = 'REPLACEMENT' and status = 'PICKED_UP' then 'PICKUP_SCHEDULED'
                    when request_type = 'REPLACEMENT' and status = 'REFUNDED' then 'DELIVERED'
                    when request_type = 'RETURN' and status in ('REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'SHIPPED', 'DELIVERED', 'REJECTED', 'CLOSED') then 'CONFIRMED'
                    else status
                end
                where status in ('REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'SHIPPED', 'PICKED_UP', 'DELIVERED', 'REFUNDED', 'REJECTED', 'CLOSED')
                """);
        jdbcTemplate.execute("""
                alter table if exists return_requests
                drop constraint if exists return_requests_status_check
                """);
        jdbcTemplate.execute("""
                alter table if exists return_requests
                add constraint return_requests_status_check
                check (
                    (
                        request_type = 'REPLACEMENT'
                        and status in (
                            'UNDER_REVIEW',
                            'READY_TO_PICKUP',
                            'PICKUP_SCHEDULED',
                            'SHIPPED',
                            'DELIVERED',
                            'REJECTED'
                        )
                    )
                    or (
                        request_type = 'RETURN'
                        and status in (
                            'CONFIRMED',
                            'READY_TO_PICKUP',
                            'PICKUP_SCHEDULED',
                            'PICKED_UP',
                            'REFUNDED'
                        )
                    )
                )
                """);
    }
}
