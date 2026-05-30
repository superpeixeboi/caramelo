## Context

The API has customers, places, services, and providers. A new WhatsApp flow system needs state tracking — tickets fill that gap. They're a lightweight resource: store conversation state, no complex relationships beyond the phone number lookup.

## Goals / Non-Goals

**Goals:**
- 3 new enums in `@caramelo/enums`
- Ticket model with phone/flow/status/steps/context
- 4 CRUD routes
- Primary query: `GET /tickets?phone=X&status=open`

**Non-Goals:**
- No WhatsApp or lambda code (spec 05)
- No complex query patterns beyond qsToMongo
- No authentication on ticket routes (added in future auth spec)

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Steps storage | Embedded array in ticket | All step state is always needed together; no benefit to separate collection |
| Context object | Free-form object in schema | Each flow stores different data; validation happens in the lambda |
| Enums in shared package | New files in @caramelo/enums | Follows existing pattern from serviceStatus |
| Route pattern | Same as other resources | fetchTicket param resolver + CRUD handlers + respond middleware |

## Risks / Trade-offs

- [Risk] Embedded steps array could grow unbounded if flows are long. Mitigation: conversations are intentionally short (4-6 steps); closed tickets can be archived.
- [Trade-off] No TTL or auto-close on tickets — the lambda closes them explicitly. A future TTL could be added if abandoned conversations become an issue.
