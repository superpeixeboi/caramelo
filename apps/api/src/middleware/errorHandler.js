export function errorHandler() {
  return async (ctx, next) => {
    try {
      await next()
    } catch (err) {
      ctx.status = err.status || 500
      const id = ctx.state.requestId
      const body = { error: err.message }
      console.error(`[${id}] ← [${ctx.status}]`, err.message)
      if (err.details) {
        body.details = err.details
      }
      if (ctx.status === 500) {
        console.log(err)
        body.error = 'Internal server error'
      }
      ctx.body = body
    }
  }
}
