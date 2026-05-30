## Why

WhatsApp conversation flows need a state-tracking resource. Tickets store the current step, accumulated context, and conversation history for each phone number. This change adds the Ticket model + routes to the existing API and the required enums to `@caramelo/enums`.

## What Changes

- Add 3 new enum files to `@caramelo/enums` (ticketFlow, ticketStatus, ticketStepStatus)
- Create `src/models/Ticket.js` extending MongoModel
- Create `src/middleware/ticketMiddleware.js` with 4 handlers
- Create `src/routes/ticketRouter.js` with 4 routes
- Register ticketRouter in app.js

## Capabilities

### New Capabilities
- `04-implement-tickets`: Ticket resource — model, enums, CRUD routes for tracking multi-step conversation state.

### Modified Capabilities
- None.

## Impact

- 3 new enum files in packages/enums
- 3 new files in apps/api (model, middleware, router)
- app.js modified to register the new router
