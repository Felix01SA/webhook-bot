import { Middleware } from 'koa'

export const LoggerMiddleware: Middleware = async (ctx, next) => {
    console.log(`${ctx.method.toUpperCase()} ${ctx.URL.pathname} - ${ctx.host}`)

    await next()
}
