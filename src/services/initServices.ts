import CustomCommand from "../commands/customCommand"
import Ping from "../commands/ping"
import SetCommand from "../commands/setCommand"
import { DatabaseService } from "../db/db"
import GuildCreate from "../events/guildCreate"
import GuildMemberAdd from "../events/guildMemberAdd"
import InteractionCreate from "../events/interactionCreate"
import Ready from "../events/ready"
import type DiscordCommand from "../interfaces/IDiscordCommand"
import type DiscordEvent from "../interfaces/IDiscordEvent"
import type { Environment } from "../interfaces/IEnviroment"
import CommandService from "./commandService"

function validateEnvironment(): Environment {
    const botToken = process.env.BOT_TOKEN
    const appId = process.env.APP_ID
    const guildId = process.env.GUILD_ID

    if (!botToken || !appId || !guildId) {
        throw new Error("Env variable is missing")
    }

    return { botToken, appId, guildId }
}

function initEvents(): DiscordEvent[] {
    return [new Ready(), new GuildMemberAdd(), new GuildCreate(), new InteractionCreate()]
}

function initCommands(): DiscordCommand[] {
    return [new Ping(), new SetCommand(), new CustomCommand()]
}

// These are created once when the module is first imported
export const env = validateEnvironment()
export const db = new DatabaseService("./data/bot.sqlite")
export const commands = initCommands()
export const events = initEvents()
export const commandService = new CommandService(env)
