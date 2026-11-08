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
| REFRESH_TOKEN_DAYS | Refresh token lifetime in days (default 7) |

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Service health check |
| POST | /auth/signup | Create an account |
| POST | /auth/login | Log in and receive an access token |
| GET | /me | Current user's profile (needs token) |
| GET | /admin/users | List users (admin only) |
| POST | /auth/refresh | Exchange a refresh token for new tokens |
| POST | /auth/logout | Revoke a refresh token |

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
| 200 | Returns `accessToken` (JWT, 15 min), refreshToken (7 days), `tokenType` and the user |
| 400 | Invalid input |
| 401 | Invalid email or password (same message for both) |
| 429 | Too many failed attempts (10 per 15 minutes per IP) |

Use the token on protected routes with the header `Authorization: Bearer <accessToken>`.

### Refresh tokens and logout

POST /auth/refresh and POST /auth/logout both take the body `{ "refreshToken": "..." }`.

| Endpoint | Status | Meaning |
|----------|--------|---------|
| /auth/refresh | 200 | New accessToken and a NEW refreshToken (the old one is revoked) |
| /auth/refresh | 401 | Unknown, expired or already used token |
| /auth/logout | 204 | Token revoked (also returned for unknown tokens) |
| both | 400 | Invalid input |

Refresh tokens are random strings, and only their SHA-256 hash is stored in the database. Each token works once (rotation). Presenting an already used token revokes all of that user's refresh tokens, because it may have been stolen.

### Protected routes and roles

Send the token as `Authorization: Bearer <accessToken>`.

| Status | Meaning |
|--------|---------|
| 401 | Missing, invalid or expired token |
| 403 | Logged in, but the role is not allowed |

Roles: `member` (default for every signup) and `admin`. There is no endpoint to become an admin. Promote a user in the database:

    UPDATE users SET role='admin' WHERE email='you@example.com';

The role is stored inside the access token, so log in again after a role change.

## Roadmap

- [x] Project setup and health endpoint
- [x] Database and signup
- [x] Login with JWT
- [x] Protected routes and roles
- [x] Refresh tokens and logout
- [ ] Tests and CI
- [ ] Docker and API docs
