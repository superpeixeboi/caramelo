## 1. Project Scaffolding

- [x] 1.1 Create `apps/api/` directory structure (src/db, src/models, src/routes, src/middleware, src/lib/errors)
- [x] 1.2 Create `apps/api/package.json` with name, scripts, and dependencies
- [x] 1.3 Create `apps/api/jsconfig.json` for JSDoc type hints
- [x] 1.4 Create `apps/api/docker-compose.yml` for local MongoDB
- [x] 1.5 Create `apps/api/.env` with default environment variables
- [x] 1.6 Run `npm install` in root to resolve workspace dependencies

## 2. Core Library

- [x] 2.1 Implement `src/lib/shortUuid.js` — nanoid wrapper (length 8)
- [x] 2.2 Implement `src/lib/errors/ValidationError.js` — status 422, carries details
- [x] 2.3 Implement `src/lib/errors/NotFoundError.js` — status 404
- [x] 2.4 Implement `src/lib/errors/index.js` — barrel export

## 3. Database Layer

- [x] 3.1 Implement `src/db/mongo.js` — MongoClient singleton with connect() and getDb()

## 4. Model Layer

- [x] 4.1 Implement `src/models/Model.js` — MongoModel base class with static CRUD and AJV validation

## 5. Middleware

- [x] 5.1 Implement `src/middleware/requestId.js` — nanoid per request, X-Request-Id header
- [x] 5.2 Implement `src/middleware/requestLogger.js` — log incoming/outgoing requests
- [x] 5.3 Implement `src/middleware/errorHandler.js` — catch-all, dispatch by err.status

## 6. Application Setup

- [x] 6.1 Implement `src/routes/health.js` — GET /health endpoint
- [x] 6.2 Implement `src/app.js` — Koa setup with middleware stack and routes
- [x] 6.3 Implement `src/index.js` — entry point: connect DB, start server

## 7. Dev Tooling

- [x] 7.1 Set up Prettier pre-commit hook (husky + lint-staged) for `apps/api/`
