import Router from '@koa/router'

export const healthRouter = new Router()

healthRouter.get('/health', (ctx) => {
  ctx.body = {
    status: 'ok',
    uptime: process.uptime(),
    requestId: ctx.state.requestId,
  }
})
