# AuthCore

![CI](https://github.com/SynkStack/AuthCore/actions/workflows/ci.yml/badge.svg)

Authentication service for NovaStack Technologies, one of the services in the OpsSynk project. A REST API that other services (InvoiceFlow, OpsMonitor, the Android app) use for signup, login and token-based access.

## Features

- Signup, login, logout
- JWT access tokens (15 minutes) and rotating refresh tokens (7 days)
- Role-based access (`member`, `admin`) and a reusable verify-token middleware
- Interactive API docs at `/docs` (Swagger UI)
- Docker image, published to GitHub Container Registry on every version tag

## Quick start (Docker)

```bash
cp .env.example .env
```

Edit `.env` and set `JWT_ACCESS_SECRET` to a long random value:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Then:

```bash
docker compose up -d --build
```

- API: http://localhost:3000
- Docs: http://localhost:3000/docs
- Health: http://localhost:3000/health

The API container creates the tables on startup. Stop everything with `docker compose down` (add `-v` to also delete the database data).

## Local development

```bash
docker compose up -d db      # only the database
npm install
npm run db:migrate
npm run dev                  # restarts on file changes
```

## Run the published image

Every `v*` tag publishes an image to GitHub Container Registry:

```bash
docker pull ghcr.io/synkstack/authcore:latest

# create the tables once
docker run --rm -e DATABASE_URL=<postgres-url> ghcr.io/synkstack/authcore:latest node src/db/migrate.js

# start the API
docker run -p 3000:3000 \
  -e DATABASE_URL=<postgres-url> \
  -e JWT_ACCESS_SECRET=<long-random-string> \
  ghcr.io/synkstack/authcore:latest
```

If other services need a PostgreSQL URL, use the service name as the host inside a shared Docker network, not `localhost`.

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
| LOGIN_RATE_LIMIT | Max failed logins per IP per 15 minutes (default 10) |
| TEST_DATABASE_URL | Database used by tests. The name must end with `_test` |

## Endpoints

Full details and a "Try it out" button are at `/docs`.

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Service health check |
| POST | /auth/signup | Create an account (always the `member` role) |
| POST | /auth/login | Log in, returns access and refresh tokens |
| POST | /auth/refresh | Exchange a refresh token for new tokens |
| POST | /auth/logout | Revoke a refresh token |
| GET | /me | Current user's profile (needs token) |
| GET | /admin/users | List users (admin only) |

Protected routes need the header `Authorization: Bearer <accessToken>`.

| Status | Meaning |
|--------|---------|
| 400 | Invalid input |
| 401 | Missing, invalid or expired token, or wrong credentials |
| 403 | Logged in, but the role is not allowed |
| 409 | Email already registered |
| 429 | Too many failed login attempts |

### Roles

Every signup creates a `member`. There is no endpoint to become an admin. Promote a user in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

The role is stored inside the access token, so log in again after a role change.

## Security notes

- Passwords are hashed with bcrypt (cost 12). Wrong email and wrong password return the same error, with the same timing.
- Access tokens are signed JWTs (HS256) that live 15 minutes.
- Refresh tokens are random strings. Only their SHA-256 hash is stored. Each token works once (rotation), and reusing an old token revokes all of that user's refresh tokens.
- Login is rate limited, input is validated with Zod, SQL uses parameters, and helmet sets secure headers.
- The container runs as a non-root user and no secrets are baked into the image.

## Testing

Tests use a separate database, so your dev data is never touched. Create it once:

```bash
docker compose exec db psql -U authcore -d authcore -c "CREATE DATABASE authcore_test;"
```

Then:

```bash
npm test                # run all tests
npm run test:coverage   # also print coverage; fails below 80%
```

## CI/CD

- Every push to `main` and every pull request runs the tests with a Postgres service container, audits production dependencies, enforces 80% coverage, then builds the Docker image and smoke-tests `/health`.
- Pushing a tag like `v1.0.0` publishes the image to `ghcr.io` and creates a GitHub Release.

## Project structure

```
src/
├── app.js            Express app (no listen, so tests can import it)
├── server.js         Starts the server, handles graceful shutdown
├── config/           Environment settings
├── controllers/      Request handlers
├── db/               Connection pool, schema and queries
├── docs/             OpenAPI spec
├── middleware/       Auth, roles, validation, rate limit, errors
├── routes/           URL to handler mapping
├── utils/            Token helpers
└── validators/       Zod schemas
tests/                Jest + Supertest tests
```

## Roadmap

- [x] Project setup and health endpoint
- [x] Database and signup
- [x] Login with JWT
- [x] Protected routes and roles
- [x] Refresh tokens and logout
- [x] Tests and CI
- [x] Docker, image publishing and API docs