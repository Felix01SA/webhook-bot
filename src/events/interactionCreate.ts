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
    await db.guild.upsert({
        where: { id: guildId },
        update: { last_interaction: new Date() },
        create: { id: guildId },
    })
}
