## Why

Customers need to request services via WhatsApp. A new lambda app handles webhooks from WhatsApp Cloud API, manages conversation state via Tickets (spec 04), and orchestrates a service-request flow.

## What Changes

- New `apps/customersFlows/` app (handler, whatsapp client, api client, ticket engine, service request flow)
- New `infra/modules/lambda/` reusable module
- New `infra/apps/customers-flows/` app config

## Capabilities

### New Capabilities
- `05-create-customer-flow`: WhatsApp webhook handler, ticket engine, service-request flow, infrastructure as code.

### Modified Capabilities
- None.

## Impact

- 5 new files in `apps/customersFlows/src/`
- 3 new files in `infra/modules/lambda/`
- 3 new files in `infra/apps/customers-flows/`
