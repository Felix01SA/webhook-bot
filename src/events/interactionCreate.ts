import { ArgsOf, Client, Discord, On } from 'discordx'
import { inject, injectable } from 'tsyringe'
import { PrismaService } from '../PrismaService'
@Discord()
@injectable()
export class InteractionCreateEvent {
    constructor(@inject(PrismaService) private db: PrismaService) {}
    @On()
    async interactionCreate(
        [interaction]: ArgsOf<'interactionCreate'>,
        client: Client
    ) {
        if (interaction.inGuild()) {
            await syncGuild(this.db, interaction.guildId)
        }

        client.executeInteraction(interaction)
    }
}

async function syncGuild(db: PrismaService, guildId: string) {
    const guildData = await db.guild.findFirst({ where: { id: guildId } })

    if (!guildData) return await db.guild.create({ data: { id: guildId } })

    await db.guild.update({
        where: { id: guildId },
        data: { last_interaction: new Date().toISOString() },
    })
}
