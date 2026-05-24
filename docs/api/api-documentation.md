# VoltMart API

Base URL: `/api`

## Auth

- `POST /auth/signup`
- `POST /auth/login`

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
- Customer: `customer@voltmart.in` / `Customer@123`
