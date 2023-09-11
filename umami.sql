Drop database if exists umami;
create database umami;
\c umami;

drop table if exists users;
create table users(
    user_id VARCHAR NOT NUll,
    chat_id VARCHAR NOT NULL,
    username VARCHAR NOT NULL,
    firstname VARCHAR NOT NULL,
    phone_number VARCHAR NOT NULL,
    user_location VARCHAR[]
);

drop table if exists product;
create table product(
    product_id VARCHAR DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    description VARCHAR NOT NULL,
    images VARCHAR[] NOT NULL,
    price INT NOT NULL,
    category_name VARCHAR NOT NULL
);

drop table if exists orders;
create table orders(
    count serial unique,
    order_id VARCHAR DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL,
    username VARCHAR NOT NULL,
    phone_number VARCHAR NOT NULL,
    total VARCHAR NOT NULL,
    products VARCHAR[] NOT NULL,
    comment VARCHAR,
    payment_type VARCHAR NOT NUll,
    exportation VARCHAR NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

drop table if exists category;
create table category(
    category_id VARCHAR DEFAULT gen_random_uuid(),
    category_name VARCHAR NOT NULL
);

drop table if exists banner;
create table banner(
    banner_id VARCHAR DEFAULT gen_random_uuid(),
    banner_img VARCHAR NOT NULL
);

drop table if exists promocode;
create table promocode(
    id VARCHAR DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    sale INT NOT NULL,
    initial_amount INT NOT NULL,
    isActive BOOLEAN,
    usedCount INT,
    created_at NOT NULL
);
