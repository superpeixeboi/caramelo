## Context

The API already has customers, places, services, and tickets. Now we need a lambda to bridge WhatsApp messages with the API. The architecture is: WhatsApp webhook → lambda handler → ticket engine → API + WhatsApp messages.

## Goals / Non-Goals

**Goals:**
- WhatsApp webhook verification (GET) and message processing (POST)
- Ticket-based conversation state management
- Service request flow (menu → description → place → confirm → create)
- Reusable Terraform lambda module
- Infra config for `customers-flows` app

**Non-Goals:**
- Multiple flow types (only service-request for now)
- Authentication/authorization on lambda endpoint (WhatsApp verification only)
- Web UI or dashboard
- Provider-side flows

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Lambda URL auth | NONE | WhatsApp calls the URL directly; verification token handles security |
| API client pattern | Direct fetch calls | Simplest approach, no SDK needed |
| Flow definition format | Steps array with getPrompt/validate/parse | Each step is self-contained; engine iterates |
| Infra location | Separate `infra/` tree | Decouples app code from deployment config |
| Step validation | Per-step validate function | Each step defines its own rules; engine delegates |
| Async prompts/validation | getPrompt/validate can be async | Some prompts need API calls (e.g., fetch places) |

## Risks / Trade-offs

- [Risk] Lambda URL with NONE auth means anyone with the URL can invoke it. Mitigation: WhatsApp verification token; URL is not publicized.
- [Risk] Inline `createService` in api.js assumes successful POST. Mitigation: error handling returns null; ticket engine checks result.
- [Trade-off] No step retry limit — customer can fail validation indefinitely. A future improvement could add max retries per step.
- [Trade-off] Flat files in src/ (no sub-dirs for modules). Keeps it simple for a single-flow app.
