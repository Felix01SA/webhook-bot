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
            await this.db.guild.upsert({
                create: { id: interaction.guildId },
                where: { id: interaction.guildId },
                update: {},
            })
        }

        client.executeInteraction(interaction)
    }
}
