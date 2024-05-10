import { Client } from 'discordx'
import { container } from 'tsyringe'

const emojisIds = {
    edit: '1238253440749011024',
    trash: '1238253442208632853',
    archive: '1238253444549050490',
    config: '1238253446885543987',
    secret: '1238253450022621276',
    chat: '1238253448466530376',
    home: '1238479283614257174',
}

export function emoji(emoji: keyof typeof emojisIds) {
    const client = container.resolve(Client)
    return client.emojis.cache.get(emojisIds[emoji])
}
