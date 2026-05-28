## Context

The monorepo currently has two Next.js frontends (apps/web, apps/docs). A backend API is needed. The API will be vanilla JavaScript (no TypeScript) using Koa, MongoDB via raw driver, with a MongoModel base class for CRUD and AJV for JSON Schema validation. Future specs will add resource routes.

## Goals / Non-Goals

**Goals:**
- Bootstrappable `apps/api` with health check and dev tooling
- Koa middleware stack: requestId, requestLogger, CORS, bodyParser, errorHandler
- MongoDB connection via MongoClient singleton (`src/db/mongo.js`)
- MongoModel base class with static CRUD + AJV validation on create/update
- Custom error classes (ValidationError 422, NotFoundError 404)
- Docker Compose for local MongoDB
- Turbo monorepo integration (runs alongside web/docs)
- Prettier pre-commit hook

**Non-Goals:**
- No resource routes (customers, places, services, providers — Spec 01)
- No authentication/authorization
- No rate limiting
- No structured logging beyond console
- No tests

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Language | Vanilla JS with JSDoc | User preference; keeps it simple, no TS compilation step for API |
| Framework | Koa | Lightweight, async-first middleware via `await next()` onion model |
| Database driver | Raw `mongodb` driver | User preference — no ORM overhead, full control over queries |
| Validation | AJV | Industry standard JSON Schema validator, fast, well-maintained |
| DB connection | Singleton via `src/db/mongo.js` + `getDb()` | Single client reused across all models |
| MongoModel | Static/class-level CRUD methods | Maps cleanly to REST controller pattern: `Customer.create(data)` |
| Validation timing | On both create and update | Catches data integrity issues early; AJV handles partial schemas |
| Port | 4000 | Available, avoids collisions with web (3000) and docs (3001) |
| ID generation | nanoid, length 8 | Short readable request IDs |
| Error response shape | `{ error: "<message>", details?: [...] }` | Simple, straightforward |
| Dev watch | `node --watch` (built-in) | No extra dependency, Node 18+ |
| Error classes | Custom classes with `this.status` | Clean mapping to HTTP status codes, easy errorHandler dispatch |

## Risks / Trade-offs

- [Risk] AJV validation on update with partial data → AJV's `required` array may reject partial updates. Mitigation: use `{ removeAdditional: true }` and conditionally apply required fields only on create.
- [Risk] Singleton MongoClient connection drops → MongoClient has built-in retry logic and reconnect. Mitigation: log connection errors clearly on startup and crash (fail fast).
- [Risk] Node --watch may have edge cases on Linux → Stable since Node 18, but `nodemon` is a fallback if issues arise.
- [Trade-off] Vanilla JS means no type checking at build time → JSDoc provides IDE-level type hints without compilation.
