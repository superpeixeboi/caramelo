export class NotFoundError extends Error {
  constructor(resource, id) {
    super(`${resource} not found: ${id}`)
    this.name = 'NotFoundError'
    this.status = 404
  }
}
