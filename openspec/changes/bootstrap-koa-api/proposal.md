## Why

The Caramelo platform needs a backend REST API to serve data to browser apps and lambdas. Currently the monorepo has only frontend Next.js apps. This change bootstraps `apps/api` — a vanilla JS Koa API with MongoDB, a MongoModel base class, middleware stack, and development tooling — as the foundation for all future resource endpoints.

## What Changes

- Create `apps/api/` directory with Koa server, middleware, MongoDB connection, and MongoModel base class
- Add Docker Compose for local MongoDB (replacing the removed PostgreSQL)
- Add dev tooling: node --watch, prettier pre-commit hook
- Wire into monorepo: `name: "api"` in package.json so turbo picks it up
- Deliverables: health check endpoint (GET /health), no resource routes yet

## Capabilities

### New Capabilities
- `00-bootstrap-koa-api`: Koa API foundation — server setup, MongoDB connection, MongoModel CRUD base class, middleware stack (requestId, requestLogger, errorHandler, CORS, bodyParser), custom error classes, health check endpoint, docker-compose for local MongoDB, turbo monorepo integration, prettier pre-commit hook.

### Modified Capabilities
- None.

## Impact

- New `apps/api/` workspace in the monorepo
- New runtime dependencies: koa, @koa/router, @koa/cors, @koa/bodyparser, mongodb, ajv, nanoid, dotenv
- New dev dependencies: prettier (or root shared), husky + lint-staged
- turbo.json works as-is — existing `dev` pipeline picks up the new workspace
- docker-compose.yml at root will be replaced with MongoDB version
