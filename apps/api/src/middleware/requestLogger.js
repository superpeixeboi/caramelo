export function requestLogger() {
  return async (ctx, next) => {
    const start = Date.now()
    const { method, path } = ctx.request
    const id = ctx.state.requestId

    console.log('=============================================')
    console.log(`[${id}] → ${method} ${path}`)

    await next()

    const duration = Date.now() - start
    console.log(`[${id}] ← ${ctx.status} ${duration}ms`)
  }
}
