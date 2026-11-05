# AuthCore

Authentication service for NovaStack Technologies. A REST API that other services use for signup, login and token-based access.

## Requirements

- Node.js 18.11 or higher
- npm
- Docker (for PostgreSQL)

## Setup

```bash
npm install
cp .env.example .env
docker compose up -d
npm run db:migrate
```

Edit `.env`: set `JWT_ACCESS_SECRET` to a long random value. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Run

```bash
npm run dev     # development, auto-restarts on file changes
npm start       # production
```

## Environment variables

| Name | Description |
|------|-------------|
| PORT | Port the server listens on (default 3000) |
| NODE_ENV | Runtime environment (default development) |
| POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB | Credentials for the Docker database |
| DATABASE_URL | Connection string used by the app |
| JWT_ACCESS_SECRET | Secret used to sign access tokens (keep private) |
| JWT_ACCESS_EXPIRES_IN | Access token lifetime (default 15m) |

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Service health check |
| POST | /auth/signup | Create an account |
| POST | /auth/login | Log in and receive an access token |

### POST /auth/signup

Body: `{ "email": "...", "password": "8-72 chars", "name": "..." }`

| Status | Meaning |
|--------|---------|
| 201 | Account created, returns the user (never the password hash) |
| 400 | Invalid input |
| 409 | Email already registered |

New users always get the `member` role.

### POST /auth/login

Body: `{ "email": "...", "password": "..." }`

| Status | Meaning |
|--------|---------|
| 200 | Returns `accessToken` (JWT, 15 min), `tokenType` and the user |
| 400 | Invalid input |
| 401 | Invalid email or password (same message for both) |
| 429 | Too many failed attempts (10 per 15 minutes per IP) |

Use the token on protected routes with the header `Authorization: Bearer <accessToken>`.

## Roadmap

- [x] Project setup and health endpoint
- [x] Database and signup
- [x] Login with JWT
- [ ] Protected routes and roles
- [ ] Refresh tokens and logout
- [ ] Tests and CI
- [ ] Docker and API docs
