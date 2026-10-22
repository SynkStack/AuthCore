# AuthCore – authentication service for NovaStack
## Requirements

- Node.js 18.11 or higher
- npm

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` if you want a different port.

## Run

```bash
npm run dev     # development, auto-restarts on file changes
npm start       # production
```

## Environment variables

| Name | Description | Default |
|------|-------------|---------|
| PORT | Port the server listens on | 3000 |
| NODE_ENV | Runtime environment | development |

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Service health check |

Example:

```bash
curl http://localhost:3000/health
```

```json
{ "status": "ok", "service": "authcore", "uptime": 12.34 }
```

## Roadmap

- [x] Project setup and health endpoint
- [ ] Database and signup
- [ ] Login with JWT
- [ ] Protected routes and roles
- [ ] Refresh tokens and logout
- [ ] Tests and CI
- [ ] Docker and API docs