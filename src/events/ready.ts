import { ArgsOf, Client, Discord, Once } from 'discordx'

@Discord()
export class ReadyEvent {
    @Once()
    async ready([event]: ArgsOf<'ready'>, client: Client) {
        await client.initApplicationCommands()

        console.log('Bot on!')
    }
}
