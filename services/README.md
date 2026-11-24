# Frontend service boundary

Typed API clients in this directory call the FINORA NestJS REST API. The backend uses MySQL directly through `mysql2` and parameterized SQL; its Hostinger-compatible schema is in `../Personal-Expense-Tracker-Backend/database.sql`.

The frontend API base URL is configured with `NEXT_PUBLIC_API_BASE_URL`; locally, use `http://localhost:4000/api/v1` (the NestJS backend's default port and route prefix). Copy `.env.example` to `.env.local` if you need to override it, then restart the frontend. Access tokens remain in memory, refresh tokens are held in an HttpOnly cookie, and credentials/database settings must never be exposed through `NEXT_PUBLIC_*`.

Password recovery uses `POST /auth/forgot-password` with `{ "email": "..." }` and `POST /auth/reset-password` with `{ "token": "...", "password": "...", "confirmPassword": "..." }`. The backend must implement these routes and send reset emails through a configured provider; until then the recovery forms cannot complete requests.
