## Context

The customer domain (customers, places, hired services) is implemented. Providers are the other side of the platform — they offer services that customers can hire. This change adds the Provider resource and allows providers to view and update services assigned to them.

## Goals / Non-Goals

**Goals:**
- Provider model with name, email, phone, address, zip, coordinates (lat/lng), availability
- Service model updated with `providerId` (optional) and `['pending', 'accepted']` statuses
- Provider CRUD routes (5 endpoints)
- Provider service access routes (index, show, patch — 3 endpoints)
- Shared Service model — no separate ProviderService collection

**Non-Goals:**
- No state machine or workflow validation (future spec)
- No auth/ownership enforcement (providerId in URL is the filter)
- No provider service create or delete (customer manages that)
- No customer-side route changes (customers already PATCH providerId onto services)

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Service ownership | Shared model, no ownership enforcement | Provider filters by `providerId` param; real auth comes later |
| Provider assignment | Customer PATCHes `providerId` on service | Customer picks the provider, provider accepts via status update |
| Coordinates type | `{ lat: number, lng: number }` | Simple, standard GeoJSON-like format |
| Availability format | Array of `{ day, start, end }` | Flexible, easy to validate and query |
| Status enum | `pending`, `accepted` | Minimal for current workflow; more states in future specs |
| Router separate | New `providerRouter.js` | Follows established pattern from customerRouter |
| Middleware | Single `providerMiddleware.js` | Handles both Provider CRUD and service access (8 handlers is manageable) |

## Risks / Trade-offs

- [Risk] No ownership enforcement — a provider could access another's service by guessing IDs. Mitigation: URL-level filtering by `providerId` provides basic isolation; auth spec adds proper enforcement.
- [Risk] Status enum change could affect existing services. Mitigation: `['pending', 'accepted']` replaces the old values; any migration of existing data is out of scope for now.
- [Trade-off] Availability stored as array of objects — querying for "providers available on Monday" requires application-level logic rather than direct DB queries.
