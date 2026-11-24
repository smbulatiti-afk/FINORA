# FINORA — Financial Organization and Record Assistant

FINORA is a frontend-only personal finance application built with Next.js, TypeScript, Tailwind CSS, and Lucide icons. Its tagline is “Organize Your Finances. Track Your Progress.” User accounts, transactions, categories, sessions, and theme preferences are stored in the browser; this project does not include an API, database, or real authentication.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

- Unified sign in: `/login` — enter a registered username/email and any non-empty password. The account role determines `/admin/*` or `/user/*`.
- User registration: `/user/register` — creates a local account and returns to sign in.
- `/admin/login` and `/user/login` redirect to the unified `/login` page.
- Local administrator sign in: use `admin` or `admin@example.com` with any non-empty password.

User accounts and transactions start empty. Categories are typed as income or expense, and only matching categories appear in each transaction form. Starter category options can be managed by the administrator. The local administrator can review registered users and all transactions. The state (session, transactions, categories, users, and theme) persists in local storage. Use the sidebar to explore the role-specific pages. No passwords are saved or authenticated.

Amounts use Philippine pesos (PHP). Transactions are assigned to a reporting month by their transaction date, not their creation date. User and admin dashboards support month navigation; transaction pages support search and category, type, month, and year filters. Every data table and the category list use client-side pagination with selectable page sizes. Admins can manage records across users, and date pickers allow historical entries. All transaction state remains frontend-only and is structured for later API integration. The selected light/dark theme is available on public and authenticated pages and is restored from local storage.

## Frontend structure

- `app/` — App Router routes for both role workspaces and auth screens.
- `components/` — reusable dashboard, chart, table, form, and auth UI.
- `contexts/` — browser-only state and global theme provider.
- `lib/mock-data.ts` — empty initial user and transaction state, plus starter category options.
- `types/` — shared frontend domain types.
- `services/README.md` — seam for replacing mock state operations with NestJS service implementations later.

## Validation

```bash
npm run typecheck
npm run build
```
