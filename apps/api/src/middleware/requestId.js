import { shortUuid } from '../lib/shortUuid.js'

export function requestId() {
  return async (ctx, next) => {
    const id = shortUuid()
    ctx.state.requestId = id
    ctx.set('X-Request-Id', id)
    await next()
  }
}
