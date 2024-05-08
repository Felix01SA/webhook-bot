import { CommandInteraction, PermissionsString } from 'discord.js'
import { GuardFunction } from 'discordx'

export const PermissonsGuard = (
    permissions: PermissionsString[]
): GuardFunction<CommandInteraction> => {
    return async (interaction, client, next) => {
        const { memberPermissions } = interaction

        if (!memberPermissions?.has(permissions)) {
            interaction.reply({
                content: 'Você não tem permição para usar essa interação.',
                ephemeral: true,
            })
        }

        await next()
    }
}
