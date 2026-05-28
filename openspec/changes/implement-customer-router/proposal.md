## Why

The API foundation is in place. Now it needs real resources. This change implements the full customer-domain REST endpoints — Customers, their Places, and hired Services — the core data model of the Caramelo platform. Without these routes the API is just a health check.

## What Changes

- Add automatic `createdAt`/`updatedAt` timestamps to MongoModel `create()` and `updateById()`
- Create 3 domain models: Customer, Place, Service (extending MongoModel with JSON Schema)
- Create a single `src/routes/customers.js` with 15 routes across a 3-level nested hierarchy using `router.param()` for parent resolution
- Register the new router in `app.js`
- No new dependencies

## Capabilities

### New Capabilities
- `01-implement-customer-router`: Customer-domain REST resources — Customer CRUD, Place CRUD nested under customer, Service CRUD nested under place, all using `router.param()` for automatic parent validation, and MongoModel auto-timestamps.

### Modified Capabilities
- `00-bootstrap-koa-api`: MongoModel `create()` and `updateById()` gain automatic `createdAt`/`updatedAt` timestamps. This is a backward-compatible enhancement — existing health check is unaffected.

## Impact

- `src/models/Model.js` — modify `create()` and `updateById()` to inject timestamps
- `src/models/Customer.js` — new file
- `src/models/Place.js` — new file
- `src/models/Service.js` — new file
- `src/routes/customers.js` — new file, single router with 15 routes
- `src/app.js` — register the new customer router
- No new npm dependencies, no changes to middleware stack, no changes to docker-compose or tooling
