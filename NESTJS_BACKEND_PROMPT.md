# FINORA NestJS Backend Build Prompt

Copy this prompt into the AI coding agent working in this repository:

---

## Role and objective

Act as a senior NestJS, MySQL, Prisma, and Next.js integration engineer. Inspect the existing FINORA frontend first, then implement a production-minded NestJS REST API that matches its current features and data model. Integrate the frontend through its existing service boundary without replacing or rebuilding the UI.

Work in this repository. Keep the existing Next.js application at the repository root and create the NestJS application in a separate `backend/` directory. Do not overwrite or move the frontend. The frontend is FINORA (Financial Organization and Record Assistant), a personal finance tracker using Philippine pesos (PHP).

Do not stop after producing an architecture proposal or snippets. Implement the backend, migrations, tests, setup documentation, and typed frontend service integration. Run the available checks and report what passed, what did not, and any deployment assumptions that still need confirmation.

## Inspect the existing application

Read the current source before making changes, especially:

- `types/index.ts` — `AppUser`, `Session`, `Transaction`, `Category`, roles, and transaction types.
- `contexts/AppContext.tsx` — current state operations, localStorage keys, registration, login, and user/transaction/category CRUD.
- `lib/mock-data.ts` — empty initial users and transactions plus seven starter categories.
- `lib/format.ts` — PHP formatting, date keys, and month navigation.
- `services/README.md` — intended boundary for typed API services.
- `components/AuthForms.tsx`, `components/TransactionForm.tsx`, and `components/TransactionEditor.tsx` — auth and transaction inputs/validation.
- `app/admin/` — admin dashboard, user management, categories, and all-transactions views.
- `app/user/` — dashboard, income/expense forms, transaction history, and reports.
- `components/Pagination.tsx` — current page sizes, filters, and the pagination metadata shape.
- `README.md` — current local development and frontend behavior.

The existing frontend is a prototype, not an authentication system. `AppContext` currently treats `admin`/`admin@example.com` as a local magic login, does not verify or store passwords, and keeps users, transactions, and categories in localStorage. Do not copy those shortcuts into the backend. The login form accepts an identifier and password; registration asks for name, username, email, password, and confirmation. The registration flow creates a regular user and then returns to sign-in. Admin login routes redirect to the unified login page.

## Existing behavior to preserve

Implement these features with database-backed data and preserve their current UX:

1. **Users and authentication**
   - User fields currently shown are `name`, `username`, `email`, `role`, and `joinedAt`.
   - Public registration always creates a `user`; there is no public admin registration.
   - Users can sign in by username or email.
   - Admins can search and filter the user list by role, edit name/username/email, and delete an account. Deleting a user currently removes that user’s transactions too.
   - The admin user list currently displays `Active` statically; do not imply account suspension controls unless the UI is explicitly extended. Never expose credentials or password hashes in a user response.

2. **Categories**
   - Categories are global and admin-managed. Each has a name, color, and type (`income` or `expense`).
   - Transaction forms only offer categories matching the transaction type.
   - Preserve the seven intentional starter categories in `lib/mock-data.ts` (Housing, Food & dining, Transport, Shopping, Health, Salary, Freelance, with their current colors and types) as an optional one-time category seed. Never seed demo users or transactions, and do not recreate categories on every application startup.
   - Editing or deleting a category must not silently rewrite old transaction labels. The current UI retains category text in historical transactions after a category is deleted.

3. **Transactions**
   - A transaction has an owner, `type`, `title`, category label, numeric amount, calendar date, and optional description. Admins can create/edit/delete any user’s transactions; a user can manage only their own.
   - Users add income and expenses separately. Admin transaction editing also selects a user.
   - Historical dates are allowed and drive month/year reports.
   - The transaction list supports search; admin filters by user, type, category, month, and year; user filters by type, category, month, year, and exact date.
   - User deletion cascades to that user’s transactions. Category deletion preserves the old category label on transactions.
   - The UI formats amounts as PHP with `Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" })`. Persist monetary values as MySQL `DECIMAL`, never `FLOAT` or `DOUBLE`; validate positive amounts with at most two fractional digits.

4. **Dashboards and reports**
   - Admin dashboard: registered user count, selected-month transaction count, income/expense totals, seven-month trend series, recent activity, and a paginated per-user monthly summary.
   - Admin transaction page: all-user transactions plus paginated all-time totals by user.
   - User dashboard: selected-month income, expenses, balance, transaction count, recent transactions, and seven-month income/expense series.
   - User reports: selected-month totals, balance, seven-month series, and expense totals grouped by category.
   - Monthly queries must be based on the transaction’s `DATE`, not its creation time or server timezone.

5. **Pagination**
   - Current frontend defaults to 10 records per page and offers 5, 10, 20, and 50.
   - Filters and search are applied before pagination, reset the page to 1, and retain the page size.
   - Return a normalized page after deletions or when a requested page is now out of range.
   - Use a consistent server-ready envelope such as:

     ```json
     {
       "data": [],
       "meta": {
         "page": 1,
         "limit": 10,
         "total": 0,
         "totalPages": 0
       }
     }
     ```

     Validate `page >= 1` and `limit` against 5, 10, 20, or 50. Apply all filters before counting and paging. Use deterministic ordering (transactions by date descending, then creation time/ID descending).

## Backend implementation requirements

- Use the currently supported NestJS and Node.js LTS versions with TypeScript strict mode. Use Prisma ORM with MySQL unless the repository already contains an established backend ORM. Put all backend-specific dependencies and scripts in `backend/package.json`; do not mix Nest dependencies into the frontend package.
- Use a versioned REST API under `/api/v1`. Organize maintainable Nest modules for auth, users, categories, transactions, dashboard/reporting, and health.
- Define Prisma schema and committed migrations for MySQL. Use UUID/string IDs suitable for the existing TypeScript string IDs. Use `DECIMAL(12,2)` or a documented equivalent for money and SQL `DATE` semantics for transaction dates.
- Use DTOs with `class-validator`/`class-transformer`; enable global validation with transformation, whitelisting, and rejection of unknown fields. Return stable, documented error responses with appropriate HTTP status codes. Never return stack traces, secrets, or password hashes.
- Document the API with Swagger/OpenAPI, including pagination metadata, query filters, role requirements, and example requests/responses.

### Suggested API surface

Use RESTful routes and adjust only when the existing UI makes a better contract clear:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/admin/users` (paginated); `PATCH/DELETE /api/v1/admin/users/:id`
- `GET /api/v1/categories` for authenticated transaction forms; admin-only `POST /api/v1/categories` and `PATCH/DELETE /api/v1/categories/:id`
- `GET/POST /api/v1/transactions`; `GET/PATCH/DELETE /api/v1/transactions/:id`
- `GET /api/v1/admin/dashboard?month=YYYY-MM`
- `GET /api/v1/admin/dashboard/users?month=YYYY-MM&page=&limit=` for the paginated monthly user summary
- `GET /api/v1/admin/transactions/summaries?page=&limit=` for paginated all-time totals by user
- `GET /api/v1/dashboard/me?month=YYYY-MM`
- `GET /api/v1/reports/me?month=YYYY-MM`
- `GET /api/v1/health` (and a database readiness check that does not reveal connection details)

Support transaction query parameters `page`, `limit`, `q`, `userId`, `type`, `category` or `categoryId`, `month` (`YYYY-MM`), `year` (`YYYY`), and `date` (`YYYY-MM-DD`) as applicable. Support user search/role filtering and category search/type filtering. Reject malformed values with clear validation errors; valid filter combinations with no matches return an empty page with correct metadata.

### Data integrity and access control

- Use a global `Category` model with an income/expense type and a uniqueness rule that prevents ambiguous duplicate names within a type.
- Link transactions to categories where possible, but also store a category name/type snapshot so historical entries remain readable if a category is renamed or deleted. Deleting a category must not delete transactions; make the relation nullable/on-delete-set-null or use an equivalent safe design.
- Keep transaction owner/name snapshots or equivalent display data consistent with the current UI. Set owner identity from the authenticated user for user requests; never trust a client-supplied user ID for a regular user. Admins may choose a user when creating or editing transactions.
- Enforce ownership in every user transaction read/update/delete path to prevent IDOR. Use explicit role guards for all admin APIs.
- Enforce unique normalized username and email at the database and service layers. Validate email, password, amounts, dates, category type, and existence of referenced users/categories.
- Store passwords only as Argon2id (or a well-justified modern password hash). Use login rate limiting and generic authentication failures.
- Replace the prototype’s magic admin login with a documented, one-time bootstrap command that creates the first admin from environment-provided credentials. Never expose admin role assignment in public registration; never commit bootstrap credentials.
- Implement access/refresh authentication with revocable refresh tokens. Prefer a short-lived access token and an HttpOnly refresh cookie; configure cookie `Secure`, `SameSite`, CORS credentials, and CSRF/origin protection correctly for local development and cross-domain production. Do not put database credentials, JWT secrets, or refresh tokens in `NEXT_PUBLIC_*` variables or localStorage.
- Do not invent email verification/password reset behavior: the current “forgot password” UI is only a placeholder. Clearly document that password reset requires a configured email provider.

For money responses, preserve decimal accuracy. Prefer fixed two-decimal strings in API DTOs and perform authoritative aggregates with Prisma Decimal/SQL decimal arithmetic. Adapt frontend service types deliberately where current components expect JavaScript numbers; do not use binary floating-point for database storage or authoritative totals.

## Integrate the existing Next.js frontend

- Implement typed fetch clients and resource services inside the existing `services/` boundary (for example `services/api-client.ts`, `auth.ts`, `users.ts`, `categories.ts`, `transactions.ts`, and `dashboard.ts`).
- Configure the API URL through `NEXT_PUBLIC_API_BASE_URL` with a safe local default only in development. Add `.env.example` files containing placeholders only; keep `.env` files and all secrets ignored.
- Replace `AppContext` localStorage persistence for users, transactions, categories, and sessions with API-backed loading and mutations. Keep the light/dark theme preference client-side; it does not need to be sent to the backend.
- Replace client-only authentication with the real login/register/me/refresh/logout calls. Map server role/session data to the existing `Session` shape and preserve route guards. Do not keep a success-shaped local fallback when the API is unavailable; show clear loading/error states through the existing SweetAlert2/UI patterns.
- Adapt the current pagination component to consume API `{ data, meta }` pages instead of fetching every record and slicing in the browser. Preserve filters, empty states, current page/page size, and reset/clamp behavior. Keep the frontend request/response types explicit and reusable.
- Preserve current category dropdown behavior, historical transaction display, PHP formatting, dashboard month navigation, SweetAlert feedback, and FINORA branding.
- Do not silently discard users’ existing localStorage data during the cutover. Provide a documented, explicit export/import or migration path for local users/transactions/categories. Existing frontend accounts have no password hashes, so require a secure password setup/reset for imported accounts; never invent or import passwords. Map old category-name snapshots safely and make the migration idempotent.

## Local MySQL and future hosting

The first development target is a MySQL server on the developer’s machine. Hosting is a later deployment, so no hostname, port, credentials, or CORS origin may be hard-coded.

- Provide a local `backend/.env.example` using a local MySQL URL (for example `127.0.0.1:3306/finora`) and placeholders for JWT secrets, `PORT`, frontend origins, cookie settings, and optional bootstrap admin values.
- Load and validate configuration from environment variables at startup. Fail fast with a helpful message when required configuration is missing; never log passwords or full connection strings.
- Bind Nest to `0.0.0.0` and honor the host-provided `PORT`. Do not rely on a local disk for persistent data.
- Document local setup, database creation, migrations, seed, dev, build, production start, and health-check commands.
- For Render, do **not** assume Render supplies managed MySQL. Configure the Nest service to connect to a separately provisioned MySQL service that accepts connections from Render, supports TLS as required, and has correct network/firewall access.
- For Hostinger, document the required Node.js application/runtime and remote-MySQL capabilities for the selected hosting plan; do not assume every shared plan supports a persistent Nest process or remote database access.
- Document the frontend’s production `NEXT_PUBLIC_API_BASE_URL`, exact allowed CORS origins, HTTPS, database TLS, environment variables, and migration-before-deploy process for Hostinger/Render. Use different environment configuration for local and production; never ship development secrets or wildcard credentialed CORS.
- Include a deployment checklist and explain that the API host and MySQL host may be different services.

## Tests and completion criteria

Add unit and e2e tests for:

- Registration, duplicate username/email, password hashing/login, refresh/logout, and admin bootstrap.
- User/admin authorization, including attempts to access or mutate another user’s records.
- CRUD for users, transactions, and categories; user-delete transaction cascade; category deletion preserving historical labels.
- Amount/date/type validation and historical-month calculations.
- Every pagination endpoint’s page/limit metadata, limits, page clamping, empty results, and filters combined with search.
- Dashboard/report totals, category breakdowns, and summaries compared against known records.
- Frontend API service/context loading, mutations, error display, pagination, auth persistence, and logout.

Do not seed fictional users or financial transactions in any environment. Seed only the explicit starter categories if implemented. Keep test data isolated in test databases and clean up test fixtures.

Before finishing:

1. Show the final backend and frontend file tree for changed/new files.
2. Provide exact local MySQL setup, migration, seed, test, dev, and production commands.
3. Summarize the API contract and authentication/cookie/CORS design.
4. Explain localStorage migration and any password-reset limitation.
5. List build/test results and any unresolved Hostinger/Render configuration that must be confirmed.

---