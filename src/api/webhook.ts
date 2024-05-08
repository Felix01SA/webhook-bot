import { Post, Router } from '@discordx/koa'
import { Context } from 'koa'
import { inject, injectable } from 'tsyringe'
import { Client } from 'discordx'
import { EmbedBuilder, codeBlock, inlineCode } from 'discord.js'
import { brBuilder } from '@magicyan/discord'
import { env } from '../lib/env'

@Router()
@injectable()
export class Webhook {
    constructor(@inject(Client) private client: Client) {}

    @Post('/github')
    async post({ request, response }: Context) {
        const channel = this.client.channels.cache.get(env.CHANNEL_ID)
        console.log(request.body)

        if (!channel?.isTextBased()) return

        const commit = request.body as PushRespose

        const embed = new EmbedBuilder()
            .setAuthor({
                name: request.body.sender.login,
                iconURL: request.body.sender.avatar_url,
            })
            .setTitle('Novo Commit')
            .setDescription(commit.head_commit.message)

        const files = {
            added: commit.commits.map((commit) => commit.added),
            removed: commit.commits.map((commit) => commit.removed),
            modified: commit.commits.map((commit) => commit.modified),
        }

        console.log(files)

        await channel.send({ embeds: [embed] })
    }
}
