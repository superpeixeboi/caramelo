## Purpose

Add a Ticket resource to the REST API for tracking multi-step WhatsApp conversation flows. Includes new enums in `@caramelo/enums` (ticket flow, status, step status), a Ticket model extending MongoModel, and CRUD routes. Tickets will be consumed by lambda functions in spec 05.

## Requirements

### Requirement: Ticket enums
The `@caramelo/enums` package SHALL export enums for ticket flow, status, and step status with the standard `{ KEY: { value } }` pattern.

#### Scenario: Ticket flow enum
- **WHEN** `TICKET_FLOW` is imported
- **THEN** it SHALL contain `SERVICE_REQUEST` with `{ value: 'service-request' }`

#### Scenario: Ticket status enum
- **WHEN** `TICKET_STATUS` is imported
- **THEN** it SHALL contain `OPEN` and `CLOSED` with their respective values

#### Scenario: Ticket step status enum
- **WHEN** `TICKET_STEP_STATUS` is imported
- **THEN** it SHALL contain `PENDING`, `COMPLETED`, and `FAILED` with their respective values

### Requirement: Ticket model
The system SHALL provide a `Ticket` model extending MongoModel with collection `tickets`.

#### Scenario: Ticket is defined
- **WHEN** `Ticket` is imported
- **THEN** `Ticket.collectionName` SHALL be `'tickets'`

### Requirement: Ticket creation
The system SHALL allow creating tickets with `phone`, `flow`, `status`, `context`, `currentStepIndex`, and `steps` array.

#### Scenario: Create ticket
- **WHEN** `POST /tickets` is called with `{ phone: "5511999999999", flow: "service-request", status: "open", steps: [...], currentStepIndex: 0 }`
- **THEN** the response SHALL be `201` with the created ticket

### Requirement: Ticket lookup by phone and status
The system SHALL support querying tickets by phone and status for lambda consumption.

#### Scenario: Find open ticket by phone
- **WHEN** `GET /tickets?phone=5511999999999&status=open` is called
- **THEN** the response SHALL be `200` with an array of matching tickets

### Requirement: Ticket update
The system SHALL support updating ticket fields (context, steps, currentStepIndex, status).

#### Scenario: Patch ticket
- **WHEN** `PATCH /tickets/:ticketId` is called with updated `steps` and `currentStepIndex`
- **THEN** the response SHALL be `200` with the updated ticket
