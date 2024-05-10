import { Middleware, Post, Router } from '@discordx/koa'
import { inject, injectable } from 'tsyringe'
import { Client } from 'discordx'
import { ButtonBuilder, ButtonStyle, EmbedBuilder, codeBlock } from 'discord.js'
import { brBuilder, createRow } from '@magicyan/discord'
import { PrismaService } from '../PrismaService'
import { Context } from 'koa'
import crypto from 'node:crypto'
import { emoji } from '../lib/emoji'
import { LoggerMiddleware } from './middlewares/logger'
import { NoPushEvent } from './middlewares/noPushEvent'

@Router()
@Middleware(LoggerMiddleware, NoPushEvent)
@injectable()
export class Webhook {
    constructor(
        @inject(Client) private client: Client,
        @inject(PrismaService) private db: PrismaService
    ) {}

    @Post('/:id/github')
    async post(context: Context & { params: { id: string } }) {
        const { id } = context.params

        const guildData = await this.db.guild.findUnique({
            where: { id },
        })

        if (!verify_signature(context, guildData?.secret!)) {
            context.response.status = 401
            context.body = { error: 'auth secret not valid' }
            return
        }

        const body = context.request.body as PushRespose

        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${body.repository.full_name}`,
                iconURL: body.sender.avatar_url,
                url: body.repository.html_url,
            })
            .setTitle('Novo Commit: ' + body.head_commit.id.slice(0, 7))
            .setURL(body.head_commit.url)
            .setDescription(body.head_commit.message)

        const files: {
            added: string[]
            removed: string[]
            modified: string[]
        } = {
            added: [],
            removed: [],
            modified: [],
        }

        body.commits.forEach((commit) => {
            commit.added.forEach((file) => files.added.push(file))
            commit.modified.forEach((file) => files.modified.push(file))
            commit.removed.forEach((file) => files.added.push(file))
        })

        if (files.added.length) {
            embed.addFields({
                name: `${emoji('archive')} Arquivos Adicionados`,
                value: codeBlock(brBuilder(files.added)),
                inline: true,
            })
        }

        if (files.modified.length) {
            embed.addFields({
                name: `${emoji('edit')} Arquivos Modificados`,
                value: codeBlock(brBuilder(files.modified)),
                inline: true,
            })
        }
        if (files.removed.length) {
            embed.addFields({
                name: `${emoji('trash')} Arquivos Removidos`,
                value: codeBlock(brBuilder(files.removed)),
                inline: true,
            })
        }

        const buttonsRow = createRow(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('Compare')
                .setURL(body.repository.html_url)
        )

        const channel = this.client.channels.cache.get(
            guildData?.webhook_channel!
        )

        if (!channel || !channel.isTextBased()) {
            context.response.status = 500
            context.body = { error: 'Channel not found' }
            return
        }

        await channel.send({ embeds: [embed], components: [buttonsRow] })

        context.status = 200
    }
}

function verify_signature(ctx: Context, secret: string) {
    const signature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(ctx.request.body))
        .digest('hex')
    let trusted = Buffer.from(`sha256=${signature}`, 'ascii')
    let untrusted = Buffer.from(ctx.get('x-hub-signature-256'), 'ascii')
    return crypto.timingSafeEqual(trusted, untrusted)
}
