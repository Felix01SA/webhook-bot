import { Middleware } from 'koa'

export const NoPushEvent: Middleware = async (context, next) => {
    const eventType = context.get('X-GitHub-Event')

    if (eventType === 'ping') {
        context.status = 200
        return
    }

    if (!eventType || eventType !== 'push') {
        context.status = 406
        context.body = { error: 'Event not implemented' }
        return
    }

    await next()
}
