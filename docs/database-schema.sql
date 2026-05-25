create table users (
    id bigserial primary key,
    full_name varchar(255) not null,
    email varchar(255) not null unique,
    password varchar(255) not null,
    role varchar(50) not null,
    created_at timestamp not null
);

create table category (
    id bigserial primary key,
    name varchar(255) not null unique,
    slug varchar(255) not null unique,
    description varchar(1000),
    icon varchar(50)
);

create table product (
    id bigserial primary key,
    slug varchar(255) not null unique,
    name varchar(255) not null,
    brand varchar(255) not null,
    category_id bigint not null references category(id),
    price numeric(12, 2) not null,
    original_price numeric(12, 2) not null,
    short_description varchar(500) not null,
    description varchar(4000) not null,
    specifications varchar(1000),
    rating double precision not null,
    review_count integer not null,
    featured boolean not null,
    best_seller boolean not null,
    new_arrival boolean not null,
    bulk_eligible boolean not null,
    warranty_available boolean not null,
    replacement_available boolean not null,
    badge varchar(255) not null,
    hero_tag varchar(255) not null,
    created_at timestamp not null
);

create table wishlist (
    id bigserial primary key,
    user_id bigint not null unique references users(id)
);

create table wishlist_item (
    id bigserial primary key,
    wishlist_id bigint not null references wishlist(id),
    product_id bigint not null references product(id),
    created_at timestamp not null
);

create table inventory (ll unique references users(id)
);

id bigserial primary key,
    product_id bigint not null unique references product(id),
    stock_quantity integer not null,
    low_stock_threshold integer not null,
    updated_at timestamp not null
);


create table cart (
                      id bigserial primary key,
                      user_id bigint not nu
create table cart_item (
    id bigserial primary key,
    cart_id bigint not null references cart(id),
    product_id bigint not null references product(id),
    quantity integer not null
);

create table orders (
    id bigserial primary key,
    order_number uuid not null unique,
    user_id bigint not null references users(id),
    status varchar(50) not null,
    shipping_name varchar(255) not null,
    email varchar(255) not null,
    phone varchar(50) not null,
    shipping_address varchar(1000) not null,
    city varchar(255) not null,
    postal_code varchar(20) not null,
    subtotal numeric(12, 2) not null,
    shipping_cost numeric(12, 2) not null,
    tax_amount numeric(12, 2) not null,
    total_amount numeric(12, 2) not null,
    created_at timestamp not null
);

create table order_item (
    id bigserial primary key,
    order_id bigint not null references orders(id),
    product_id bigint not null references product(id),
    quantity integer not null,
    unit_price numeric(12, 2) not null
);

create table bulk_order_inquiry (
    id bigserial primary key,
    company_name varchar(255),
    contact_person varchar(255),
    email varchar(255),
    phone varchar(50),
    product_category varchar(255),
    estimated_quantity integer,
    requirements varchar(2000),
    created_at timestamp
);
