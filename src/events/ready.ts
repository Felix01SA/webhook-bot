import { ArgsOf, Client, Discord, Once } from 'discordx'
import { PrismaService } from '../PrismaService'
import { Guild } from 'discord.js'
import { inject, injectable } from 'tsyringe'

@Discord()
@injectable()
export class ReadyEvent {
    constructor(@inject(PrismaService) private db: PrismaService) {}
    @Once()
    async ready([event]: ArgsOf<'ready'>, client: Client) {
        await client.initApplicationCommands()

        await client.guilds.fetch()
        await syncGuilds(this.db, client)

        console.log('Bot on!')
    }
}

async function syncGuilds(db: PrismaService, client: Client) {
    const promises = []

    const allGuildsData = await db.guild.findMany()

    for (const guild of client.guilds.cache) {
        if (!allGuildsData.map((g) => g.id).includes(guild[1].id)) {
            const g = guild[1]
            promises.push(db.guild.create({ data: { id: g.id } }))
        }
    }

    await Promise.all(promises)
}
