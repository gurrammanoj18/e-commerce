# VoltMart Full-Stack E-Commerce

VoltMart is a responsive hardware and electronics e-commerce platform built with:

- React frontend in `frontend/`
- Spring Boot backend in `backend/`
- PostgreSQL for persistence
- Render deployment support via `render.yaml`
- Docker-ready backend and frontend services for Render web service deployment

## Monorepo structure

- `frontend/` React storefront and admin UI
- `backend/` Spring Boot REST API with JWT auth
- `docs/` API notes and database schema
- `render.yaml` Render deployment blueprint

## Features

- Product catalog, search, filters, sorting, and pagination
- Product details with gallery, quantity selector, and cart actions
- Cart, checkout, order creation, WhatsApp and email order confirmations, and delivery-status updates
- User signup/login with JWT auth
- Bulk order inquiry flow
- Contact/support section with WhatsApp entry point
- Admin dashboard overview, orders, users, and inventory

## Local setup

### 1. Database

Start PostgreSQL locally from the backend folder:

```bash
cd backend
docker compose up -d
```

This starts a PostgreSQL 16 database on `localhost:5433` with:

- database: `voltmart`
- username: `postgres`
- password: `postgres`

### 2. Backend

```bash
cd backend
mvn spring-boot:run
```

Set the environment variables from `backend/.env.example`.
The backend now supports two local modes:

- `SPRING_PROFILES_ACTIVE=postgres` to run against PostgreSQL
- default profile to run against embedded H2
- set `APP_WHATSAPP_ENABLED=true` plus the Meta WhatsApp Cloud API credentials if you want automatic customer notifications after checkout and on admin status changes
- set `APP_EMAIL_ENABLED=true` plus SMTP settings if you want matching email notifications for the same order events

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Set `REACT_APP_API_BASE_URL` from `frontend/.env.example`.

## Seed credentials

    - Admin: ` admin@voltmart.in ` / `Admin@123`
- Customer: `customer@voltmart.in` / `Customer@123`

## Verification

- Backend: `cd backend && mvn test`
- Frontend: `cd frontend && npm run build`

## Deployment on Render

1. Push this repository to GitHub.
2. In Render, create Docker web services from `render.yaml` or point each service at `backend/Dockerfile` and `frontend/Dockerfile`.
3. Provision PostgreSQL and copy the connection values into backend environment variables.
4. Set `APP_JWT_SECRET` to a long secure value.
5. Update the frontend/backend public URLs if you rename the Render services.

## API and schema docs

- API overview: `docs/api/api-documentation.md`
- Database schema: `docs/database-schema.sql`
- Backup and logging runbook: `docs/infrastructure/backup-and-logging.md`
