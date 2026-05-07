# ExpensePulse

ExpensePulse is a self-hosted expense tracker for **web + mobile** using a single **HTML-based frontend** codebase.

## Stack
- Frontend: React + Vite (+ Ionic UI), Capacitor-ready for mobile packaging
- Backend: Node.js + Express
- DB: PostgreSQL (self-hosted)
- ORM: Prisma
- Auth: JWT access/refresh + bcrypt hashing
- Charts: Chart.js / ECharts compatible dashboard APIs
- PDF: server-side PDF export endpoint

## Acceptance Coverage
- Register/login/logout/refresh/profile auth APIs
- Multi-user data isolation by `userId`
- Manual expense CRUD (`amount`, `date`, `category`, `note/description`)
- Category CRUD
- **Budget CRUD** (added) for budget-vs-actual chart support
- Dashboard aggregations: monthly trend, category distribution, cashflow, budget-vs-actual
- Date range + category filtering
- PDF export endpoint for selected report views
- Web browser access + mobile deployability via Capacitor from same frontend
- Local infrastructure deployment via Docker Compose (Postgres + backend)

## Security Notes
- `docker-compose.yml` no longer ships hardcoded JWT secrets.
- You **must** provide `JWT_SECRET` and `JWT_REFRESH_SECRET` via environment variables.

## Quick Start
1. Create `.env` (or export env vars):
   - `JWT_SECRET=<strong-random-secret>`
   - `JWT_REFRESH_SECRET=<strong-random-secret>`
2. Start services:
   - `docker compose up --build`
3. Run Prisma migrations in backend container/environment.
4. Start frontend (`npm run dev` in frontend app).

## Mobile
Use Capacitor to package the same frontend for Android/iOS:
- build web assets
- `npx cap add android` / `npx cap add ios`
- `npx cap sync`
