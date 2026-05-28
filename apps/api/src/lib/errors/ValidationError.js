export class ValidationError extends Error {
  constructor(details) {
    super('Validation failed')
    this.name = 'ValidationError'
    this.status = 422
    this.details = details
  }
}
