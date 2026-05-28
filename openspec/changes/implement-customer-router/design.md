## Context

The API has a health endpoint, middleware stack, MongoModel base class, and MongoDB connection. Now it needs real resources. The customer domain is the first resource layer: Customer → Places → Services. This is a straightforward CRUD addition — no new infrastructure, no new middleware.

## Goals / Non-Goals

**Goals:**
- Add auto-timestamps (`createdAt`/`updatedAt`) to MongoModel
- Customer model with email validation via regex pattern
- Place model with customerId foreign key
- Service model with placeId and customerId foreign keys
- 15 REST endpoints in a single router file
- Use `router.param()` for automatic parent validation
- Wire into app.js with one import

**Non-Goals:**
- No authentication/authorization
- No pagination (simple array responses on index)
- No sorting or filtering beyond basic Mongo queries
- No provider resources (separate spec)

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Route file count | Single `customers.js` | All customer-domain routes are cohesive; ~100 lines is manageable |
| Router prefix | `/api` | Keeps routes explicit (`/customers`, `/customers/:id/places`) for readability |
| Param resolution | `router.param()` | Koa-router built-in; Express-compatible API; fires once per param per request across all matching routes |
| Parent on index | Accept extra query | Pattern uniformity outweighs the negligible cost of one `findOne` on index routes |
| Timestamps | MongoModel base class | Guaranteed uniform behavior regardless of request path (API, lambda, script) |
| Email validation | Regex pattern in JSON Schema | Avoids adding `ajv-formats` dependency |
| Foreign key storage | Plain string (not ObjectId) | Simpler to pass from URL params; no conversion needed |
| Handlers | Inline arrow functions | Concise; each handler is 1-3 lines; no separate controller file needed |
| Casing | lowerCamelCase for params | `customerId`, `placeId`, `serviceId` in code and URL params |

## Risks / Trade-offs

- [Trade-off] Extra `findById` on index routes — parent document loaded but not used by index handler. Acceptable for uniformity.
- [Risk] `router.param` fires on EVERY route with matching param name — if a route has `:customerId` but doesn't need the full document, it's loaded anyway. Mitigation: no such routes exist in this spec (all routes need or benefit from parent validation).
- [Trade-off] Plain string FKs instead of ObjectId — loses referential integrity at the database level. Mitigation: application enforces FK existence through param resolvers and MongoModel validation.
- [Risk] Timestamps on MongoModel affect ALL models — if a future model shouldn't have timestamps, the base class needs an opt-out. Mitigation: add a static `skipTimestamps` flag if needed later.
