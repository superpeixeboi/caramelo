## Purpose

Create a new `apps/customersFlows/` lambda app that handles WhatsApp conversations for existing customers. The app receives webhooks from WhatsApp Cloud API, manages conversation state via the Ticket API resource, and orchestrates business flows. The first flow is "service request" — customer describes a service, selects a place, and confirms to create a service order.

## Requirements

### Requirement: Lambda entry point
The lambda SHALL handle both WhatsApp verification (GET) and incoming messages (POST).

#### Scenario: WhatsApp verification
- **WHEN** a GET request arrives with `?hub.mode=subscribe&hub.verify_token=...`
- **THEN** the lambda SHALL validate the token and return the challenge if valid, or 403 if invalid

#### Scenario: Incoming message is processed
- **WHEN** a POST request arrives with a WhatsApp message payload
- **THEN** the lambda SHALL extract the phone number and message text, then delegate to the ticket engine

### Requirement: WhatsApp client
The system SHALL provide a module for interacting with WhatsApp Cloud API.

#### Scenario: Send message
- **WHEN** `sendMessage(to, text)` is called
- **THEN** it SHALL POST to the WhatsApp Cloud API messages endpoint with the recipient and text

#### Scenario: Parse webhook
- **WHEN** `parseWebhook(payload)` is called with a WhatsApp webhook body
- **THEN** it SHALL return `{ phone, text, media? }` extracted from the payload

### Requirement: API client
The system SHALL provide a module for calling the REST API.

#### Scenario: Get ticket by phone
- **WHEN** `getTicket(phone)` is called
- **THEN** it SHALL fetch `GET /tickets?phone=X&status=open` from the API

#### Scenario: Create and update ticket
- **WHEN** `createTicket(data)` or `patchTicket(id, data)` is called
- **THEN** it SHALL POST/PATCH the corresponding API endpoints

#### Scenario: Customer lookup
- **WHEN** `findCustomerByPhone(phone)` is called
- **THEN** it SHALL fetch `GET /customers?phone=X`

#### Scenario: Customer places
- **WHEN** `getCustomerPlaces(customerId)` is called
- **THEN** it SHALL fetch `GET /customers/:id/places`

### Requirement: Ticket engine
The system SHALL provide a `handleMessage(message, phone)` function that orchestrates the conversation flow.

#### Scenario: No open ticket creates a new one
- **WHEN** `handleMessage("Olá", "5511999999999")` is called and no open ticket exists
- **THEN** it SHALL create a new ticket and send a greeting menu

#### Scenario: Open ticket resolves current step
- **WHEN** `handleMessage("Quero um serviço de limpeza", "5511999999999")` is called and a ticket exists with a pending step
- **THEN** it SHALL parse the response, validate it, mark the step as completed, advance to the next step, and send the next prompt

#### Scenario: Invalid step response re-asks
- **WHEN** the response does not pass validation for the current step
- **THEN** the lambda SHALL send an error message and re-ask the same step

#### Scenario: Flow complete creates service and closes ticket
- **WHEN** the final step is confirmed
- **THEN** the `onComplete` callback SHALL call the API to create the service, and the ticket SHALL be closed

### Requirement: Service request flow
The system SHALL provide a "service request" flow with the following steps.

#### Scenario: Greeting and menu
- **WHEN** a new ticket is created for the service-request flow
- **THEN** the first step SHALL send a greeting with a numbered menu of options

#### Scenario: Service description
- **WHEN** the customer selects the service request option
- **THEN** the next step SHALL ask for a service description

#### Scenario: Place selection
- **WHEN** the customer provides a description
- **THEN** the next step SHALL fetch the customer's places via the API and present them as a numbered list for selection

#### Scenario: Confirmation
- **WHEN** the customer selects a place
- **THEN** the next step SHALL ask for confirmation with the collected data

#### Scenario: Service creation on confirm
- **WHEN** the customer confirms
- **THEN** the lambda SHALL call the API to create the service and close the ticket

### Requirement: Lambda package configuration
The app SHALL be a Node ESM package deployable to AWS Lambda.

#### Scenario: package.json defines lambda-compatible structure
- **WHEN** the package.json is read
- **THEN** it SHALL have a `"main"` pointing to `src/handler.js` and no build step required

### Requirement: Unknown phone fallback
The system SHALL handle cases where the phone number doesn't match an existing customer.

#### Scenario: Customer not found sends registration link
- **WHEN** the ticket engine is resolving a step that requires a customer lookup and no customer exists with that phone
- **THEN** it SHALL send a message "Você ainda não possui cadastro. Acesse caramelo.com/register" and close the ticket
