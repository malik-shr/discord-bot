import type { Client } from "discord.js"
import { commands, commandService, db, env, events } from "./services/initServices"
import Ping from "./commands/ping"
import SetCommand from "./commands/setCommand"
import CustomCommand from "./commands/customCommand"
import Cmd from "./utils/cmd"

export class BotManager {
    private client: Client

    constructor(client: Client) {
        this.client = client
    }

    async start(): Promise<void> {
        const guildCommands = db.getCommands(env.guildId)
        for (const command of commands) {
            commandService.registerCommand(command)
        }

        for (const guildCommand of guildCommands) {
            const cmd = new Cmd(guildCommand.name, guildCommand.response)
            commandService.registerCommand(cmd)
        }

        for (const event of events) {
            if (event.once) {
                this.client.once(event.name, (...args) => event.execute(...args))
            } else {
                this.client.on(event.name, (...args) => event.execute(...args))
            }
        }

        await this.client.login(env.botToken)
    }
}
