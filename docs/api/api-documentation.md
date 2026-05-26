# VoltMart API

Base URL: `/api`

## Auth

- `POST /auth/otp/request`
- `POST /auth/otp/verify`
- `POST /auth/admin/login`

## Catalog

- `GET /products?category=&search=&sort=&page=&size=`
- `GET /products/featured`
- `GET /products/best-sellers`
- `GET /products/{slug}`
- `GET /categories`

## Cart

- `GET /cart`
- `POST /cart/items`
- `PUT /cart/items/{itemId}`
- `DELETE /cart/items/{itemId}`

## Orders

- `POST /orders/checkout`
- `GET /orders`

## Support

- `POST /support/bulk-order`

## Admin

- `GET /admin/dashboard`
- `GET /admin/orders`
- `PATCH /admin/orders/{orderId}?status=CONFIRMED`
- `GET /admin/users`
- `GET /admin/inventory`
- `POST /admin/products`
- `PUT /admin/products/{id}`
- `DELETE /admin/products/{id}`

## Default seed accounts

- Admin: `admin@voltmart.in` / `Admin@123`
- Customer: created on first successful phone OTP verification

## OTP Provider

- Customer OTP delivery is configured for email-based verification.
