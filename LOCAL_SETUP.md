# Sumopod local setup

This runbook starts the NestJS backend, MySQL database, and Next.js frontend
from a fresh clone.

## Prerequisites

- Node.js and npm
- Docker, used only for the local MySQL container

## Backend

From the repository root, start MySQL:

```bash
docker run --name sumopod-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=tes \
  -p 3307:3306 \
  -d mysql:8
```

Create `backend/.env`:

```env
DATABASE_URL="mysql://root:root@127.0.0.1:3307/tes"
JWT_SECRET="change-this-secret-in-production-please-32chars-min"
JWT_EXPIRES_IN="7d"
PORT=4000
CORS_ORIGIN="http://localhost:3000"
```

Install dependencies, prepare the database, seed local data, and start the API:

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run start:dev
```

The backend is available at `http://localhost:4000/api`.

## Frontend

Create `starter/.env.local`:

```env
BACKEND_URL=http://localhost:4000/api
NEXT_PUBLIC_API_URL=http://localhost:4000/api
AUTH_SECRET=dev_sumopod_auth_secret_change_later_123456789
NEXTAUTH_SECRET=dev_sumopod_auth_secret_change_later_123456789
AUTH_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

The example secrets above are for local development only. Use unique secrets in
deployed environments.

Install dependencies and start the frontend:

```bash
cd starter
npm install
npm run dev
```

The frontend is available at `http://localhost:3000`.

## Seed credentials

- Admin: `admin@example.com` / `password123`
- User: `user@example.com` / `password123`

These accounts and passwords are for local development only.

## API sanity checks

With the backend running:

```bash
curl http://localhost:4000/api/products
```

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

The login response contains the authenticated user and an `accessToken`. Do not
copy that token into committed files or logs.

## Known issues and warnings

- Do not use the Ecme template credential `admin-01@ecme.com`. It is not a
  Sumopod seed account.
- Next.js may warn about parent lockfiles. This is not a blocker. Clean up
  unrelated parent lockfiles outside this repository if needed.
