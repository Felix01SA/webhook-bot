import 'core-js'
import { importx } from '@discordx/importer'
import { Koa } from '@discordx/koa'
import { CustomItents } from '@magicyan/discord'
import { Client, DIService, tsyringeDependencyRegistryEngine } from 'discordx'
import { koaBody } from 'koa-body'
import smee from 'smee-client'
import { container } from 'tsyringe'
import { env } from './lib/env'

async function run() {
    DIService.engine = tsyringeDependencyRegistryEngine.setInjector(container)

    const client = new Client({ intents: CustomItents.All })
    container.registerInstance(Client, client)
    const server = new Koa()

    await importx(__dirname + '/{api,commands,events}/**/*.{ts,js}')
    server.use(koaBody())
    await server.build()

    await client.login(process.env.BOT_TOKEN as string)
    const port = env.PORT ?? 8080
    server.listen(port, () => console.log('API ON!'))

    if (env.NODE_ENV !== 'production') {
        const proxy = new smee({
            source: env.SMEE_URI!,
            target: 'http://localhost:8080/965437190911975524/github',
        })
        proxy.start()
    }
}

void run()
