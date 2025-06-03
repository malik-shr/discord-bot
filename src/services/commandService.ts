import {
    Collection,
    REST,
    Routes,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js"
import type DiscordCommand from "../interfaces/IDiscordCommand"
import type { Environment } from "../interfaces/IEnviroment"
import { env } from "./initServices"

export default class CommandService {
    commands: Collection<string, DiscordCommand>
    commandsJSON: Collection<string, RESTPostAPIChatInputApplicationCommandsJSONBody>
    rest: REST

    constructor(env: Environment) {
        this.commands = new Collection<string, DiscordCommand>()
        this.commandsJSON = new Collection<
            string,
            RESTPostAPIChatInputApplicationCommandsJSONBody
        >()

        this.rest = new REST().setToken(env.botToken)
    }

    registerCommand(command: DiscordCommand) {
        this.commands.set(command.data.name, command)
        this.commandsJSON.set(command.data.name, command.data.toJSON())
    }

    async removeGuildCommand(name: string, guildId: string) {
        const commands = (await this.rest.get(
            Routes.applicationGuildCommands(env.appId, guildId)
        )) as any[]

        const commandToDelete = commands.find((cmd) => cmd.name === name)
        this.commands.sweep((cmd) => cmd.data.name === name)
        this.commandsJSON.sweep((cmd) => cmd.name === name)

        if (commandToDelete) {
            await this.rest.delete(
                Routes.applicationGuildCommand(env.appId, guildId, commandToDelete.id)
            )
        }
    }

    async putGuildCommands() {
        const data = (await this.rest.put(Routes.applicationGuildCommands(env.appId, env.guildId), {
            body: Array.from(this.commandsJSON.values()),
        })) as any
        console.log(`[GUILD] Successfully reloaded ${data.length} application (/) commands.`)
    }
}
