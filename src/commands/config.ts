import { brBuilder, createRow } from '@magicyan/discord'
import {
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChannelSelectMenuBuilder,
    ChannelSelectMenuInteraction,
    ChannelType,
    CommandInteraction,
    EmbedBuilder,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
    channelMention,
    inlineCode,
} from 'discord.js'
import {
    ButtonComponent,
    Discord,
    Guard,
    ModalComponent,
    SelectMenuComponent,
    Slash,
} from 'discordx'
import { PrismaService } from '../PrismaService'
import { inject, injectable } from 'tsyringe'
import { PermissonsGuard } from '../lib/guards/permissions'
import { env } from '../lib/env'

@Discord()
@Guard(PermissonsGuard(['ManageGuild', 'Administrator']))
@injectable()
export class ConfigCommand {
    constructor(@inject(PrismaService) private db: PrismaService) {}

    private buttons = {
        home: new ButtonBuilder({
            customId: 'config/home',
            style: ButtonStyle.Secondary,
            label: 'INICIO',
            emoji: '🏠',
        }),
        channel: new ButtonBuilder({
            customId: 'config/chennel',
            style: ButtonStyle.Primary,
            label: 'CANAL',
            emoji: '#️⃣',
        }),
        secret: new ButtonBuilder({
            customId: 'config/secret',
            style: ButtonStyle.Primary,
            label: 'SECRET',
            emoji: '🔑',
        }),
    }

    private embeds = {
        home: (channelId?: string | null, secret?: string | null) =>
            new EmbedBuilder()
                .setTitle('⚙️ Painel de configurações')
                .setDescription(
                    brBuilder(
                        `#️⃣ Webhook Channel: ${
                            channelId
                                ? channelMention(channelId)
                                : inlineCode('Não definido')
                        }`,
                        `🔑 Secret: ${inlineCode(
                            `${secret ?? 'Não definido'}`
                        )}`
                    )
                ),
    }

    @Slash({
        description: 'Configurações dos Webhooks',
        defaultMemberPermissions: ['ManageGuild'],
    })
    async config(interaction: CommandInteraction<'cached'>) {
        await interaction.deferReply({ ephemeral: true })

        const guildData = await this.db.guild.findUnique({
            where: { id: interaction.guildId },
        })

        const buttonsRow = createRow(this.buttons.channel, this.buttons.secret)

        interaction.editReply({
            embeds: [
                this.embeds
                    .home(guildData?.webhook_channel, guildData?.secret)
                    .setFooter({
                        text: `Webhook url: ${env.HOST_URL}/${interaction.guild.id}/github`,
                    }),
            ],
            components: [buttonsRow],
        })
    }

    @ButtonComponent({ id: 'config/home' })
    async homeButton(interaction: ButtonInteraction<'cached'>) {
        await interaction.deferUpdate()
        const guildData = await this.db.guild.findUnique({
            where: { id: interaction.guildId },
        })

        const row = createRow(this.buttons.channel, this.buttons.secret)

        interaction.editReply({
            embeds: [
                this.embeds
                    .home(guildData?.webhook_channel, guildData?.secret)
                    .setFooter({
                        text: `Webhook url: ${env.HOST_URL}/${interaction.guild.id}/github`,
                    }),
            ],
            components: [row],
        })
    }

    @ButtonComponent({ id: 'config/chennel' })
    async channelButton(interaction: ButtonInteraction<'cached'>) {
        await interaction.deferUpdate()
        const guildData = await this.db.guild.findUnique({
            where: { id: interaction.guildId },
        })
        const embed = new EmbedBuilder()
            .setTitle('⚙️ Configurar Canal')
            .setDescription(
                brBuilder(
                    '',
                    `#️⃣ Canal Atual: ${
                        guildData?.webhook_channel
                            ? channelMention(guildData.webhook_channel)
                            : inlineCode('Não definido')
                    }`
                )
            )
            .setFooter({
                text: `Webhook url: ${env.HOST_URL}/${interaction.guild.id}/github`,
            })

        const selectRow = createRow(
            new ChannelSelectMenuBuilder()
                .setChannelTypes(ChannelType.GuildText)
                .setCustomId('config/select-channel')
                .setDefaultChannels(
                    guildData?.webhook_channel
                        ? [guildData.webhook_channel]
                        : []
                )
        )

        const buttonsRow = createRow(this.buttons.home)

        interaction.editReply({
            embeds: [embed],
            components: [selectRow, buttonsRow],
        })
    }

    @ButtonComponent({ id: 'config/secret' })
    async secretButton(interaction: ButtonInteraction<'cached'>) {
        const modal = new ModalBuilder()
            .setCustomId('config/secret-modal')
            .setTitle('Configure a Key')
            .setComponents(
                createRow(
                    new TextInputBuilder()
                        .setCustomId('keyInput')
                        .setLabel('Secret')
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                )
            )

        interaction.showModal(modal)
    }

    @SelectMenuComponent({ id: 'config/select-channel' })
    async selectMenuChaneel(
        interaction: ChannelSelectMenuInteraction<'cached'>
    ) {
        await interaction.deferUpdate()

        const channelId = interaction.values[0]

        const updated = await this.db.guild.update({
            where: { id: interaction.guildId },
            data: { webhook_channel: channelId },
        })

        const buttonsRow = createRow(this.buttons.channel, this.buttons.secret)

        interaction.editReply({
            embeds: [
                this.embeds
                    .home(updated.webhook_channel, updated.secret)
                    .setFooter({
                        text: `Webhook url: ${env.HOST_URL}/${interaction.guild.id}/github`,
                    }),
            ],
            components: [buttonsRow],
        })
    }

    @ModalComponent({ id: 'config/secret-modal' })
    async modal(interaction: ModalSubmitInteraction<'cached'>) {
        await interaction.deferUpdate()
        const secret = interaction.fields.getTextInputValue('keyInput')

        const updated = await this.db.guild.update({
            where: { id: interaction.guildId },
            data: { secret },
        })

        const buttonsRow = createRow(this.buttons.channel, this.buttons.secret)

        interaction.editReply({
            embeds: [
                this.embeds.home(updated.webhook_channel, secret).setFooter({
                    text: `Webhook url: ${env.HOST_URL}/${interaction.guild.id}/github`,
                }),
            ],
            components: [buttonsRow],
        })
    }
}
