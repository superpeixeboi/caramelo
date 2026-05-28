## Why

The customer index endpoints return all documents with no filtering. Every `GET /api/customers` returns the full collection. A query string to Mongo filter utility enables filtered queries (`?email=x`, `?age__gte=18`) with automatic type coercion based on each model's JSON Schema — no manual parsing in route handlers.

## What Changes

- Create `src/lib/qsToMongo.js` — utility that transforms `ctx.query` into a MongoDB filter object using `schema.properties` for type coercion
- Update 3 index route handlers in `src/routes/customers.js` to use `qsToMongo`
- No new dependencies
- No new middleware, no config changes

## Capabilities

### New Capabilities
- `02-qs-to-mongo`: Query string to MongoDB filter conversion, supporting string/number/boolean/date types, `__gte`/`__lte`/`__gt`/`__lt`/`__ne`/`__like` operators, comma-separated `$in`/`$nin`, and schema-based type coercion with `ValidationError` on type mismatch.

### Modified Capabilities
- `01-implement-customer-router`: The 3 index routes (`GET /customers`, `GET /customers/:id/places`, `GET /customers/:id/places/:pid/services`) gain filtering via `qsToMongo`. Backward compatible — existing unfiltered calls return all documents as before.

## Impact

- `src/lib/qsToMongo.js` — new file, ~60 lines
- `src/routes/customers.js` — modify 3 index route handlers to wrap `ctx.query` with `qsToMongo`
