import {
    Collection,
    REST,
    Routes,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js"
import type DiscordCommand from "../interfaces/IDiscordCommand"
import type { DatabaseService } from "../db/db"
import Ping from "../commands/ping"
import type { Environment } from "../interfaces/IEnviroment"
import CreateCommand from "../commands/createCommand"
import Set from "../commands/set"
import CustomCommand from "../commands/customCommand"

export default class CommandService {
    commands: Collection<string, DiscordCommand>
    commandsJSON: Collection<string, RESTPostAPIChatInputApplicationCommandsJSONBody>
    env: Environment
    db: DatabaseService
    rest: REST

    constructor(env: Environment, db: DatabaseService) {
        this.commands = new Collection<string, DiscordCommand>()
        this.commandsJSON = new Collection<
            string,
            RESTPostAPIChatInputApplicationCommandsJSONBody
        >()
        this.env = env
        this.db = db
        this.rest = new REST().setToken(this.env.botToken)
    }

    async init() {
        this.registerCommands([new Ping(), new Set(this.db), new CreateCommand(this.db, this)])
        await this.refreshAllGuildCommands()
    }

    registerCommands(commands: DiscordCommand[]) {
        for (const command of commands) {
            this.commands.set(command.data.name, command)
            this.commandsJSON.set(command.data.name, command.data.toJSON())
        }
    }

    async removeCommand(name: string, guildId: string) {
        const commands = (await this.rest.get(
            Routes.applicationGuildCommands(this.env.appId, guildId)
        )) as any[]

        const commandToDelete = commands.find((cmd) => cmd.name === name)
        this.commands.sweep((cmd) => cmd.data.name === name)
        this.commandsJSON.sweep((cmd) => cmd.name === name)

        if (commandToDelete) {
            await this.rest.delete(
                Routes.applicationGuildCommand(this.env.appId, guildId, commandToDelete.id)
            )
        }
    }

    async refreshAllGuildCommands() {
        const guilds = this.db.getGuilds()

        for (const guild of guilds) {
            const guildCommands = this.db.getCommands(guild.id)

            for (const guildCommand of guildCommands) {
                this.registerCommands([new CustomCommand(guildCommand.name, guildCommand.response)])
            }

            const data = (await this.rest.put(
                Routes.applicationGuildCommands(this.env.appId, guild.id),
                {
                    body: Array.from(this.commandsJSON.values()),
                }
            )) as any
            console.log(`[GUILD] Successfully reloaded ${data.length} application (/) commands.`)
        }
    }
}
