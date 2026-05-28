## Why

The platform needs providers alongside customers. This change adds the Provider resource — CRUD endpoints for managing providers, and read/update access to services assigned to them. The Service model gains the `providerId` field and updated statuses to support the provider workflow.

## What Changes

- Modify `Service` schema: replace status enum with `['pending', 'accepted']`, add optional `providerId`
- Create `Provider` model with name, email, phone, address, zip, coordinates, availability
- Create `providerMiddleware.js` with CRUD + service access handlers
- Create `providerRouter.js` with `router.param('providerId')` + `router.param('serviceId')` and 8 routes
- Register the new router in `app.js`

## Capabilities

### New Capabilities
- `03-implement-provider-router`: Provider REST resource — CRUD for providers, read/update for assigned services via shared Service model.

### Modified Capabilities
- `01-implement-customer-router`: Service model gains `providerId` field and updated statuses. Existing customer endpoints continue to work unchanged — `providerId` is optional.

## Impact

- `src/models/Service.js` — modify status enum, add `providerId`
- `src/models/Provider.js` — new file
- `src/middleware/providerMiddleware.js` — new file
- `src/routes/providerRouter.js` — new file
- `src/app.js` — register providerRouter
- No new dependencies, no config changes
