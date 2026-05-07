# ExpensePulse

ExpensePulse is a self-hosted, multi-user expense tracker with dashboard charts and PDF export.

## Stack
- **Frontend**: React + Vite (HTML-based), Chart.js, Capacitor (mobile packaging)
- **Backend**: Node.js + Express + Prisma
- **Database**: PostgreSQL (self-hosted via Docker Compose)
- **Auth**: JWT access + refresh tokens, bcrypt password hashing
- **PDF**: PDFKit

## Features
- Register / Login / Logout / Refresh / Profile
- Expense CRUD (amount, date, category, note/description)
- Category CRUD
- Dashboard datasets:
  - Monthly trend
  - Category distribution
  - Cashflow over time
  - Budget vs actual
- Filters: date range + category
- Authenticated PDF export for selected dashboard view
- Multi-user data isolation
- Responsive web UI + Capacitor mobile packaging

## Run (Local)
```bash
docker compose up --build
```

Services:
- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- Postgres: localhost:5432

## Dev (without Docker)
### Backend
```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Mobile Packaging (Capacitor)
```bash
cd frontend
npm run build
npm run cap:sync
npm run cap:add:android   # first time
npm run cap:add:ios       # first time (macOS)
npm run cap:open:android
```
