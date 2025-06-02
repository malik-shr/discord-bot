import { Events, type ClientEvents, type GuildMember, type Interaction } from "discord.js"
import type { DatabaseService } from "../db/db"
import type DiscordEvent from "../interfaces/discord-event"
import type CommandService from "../services/command-service"

export default class InteractionCreate implements DiscordEvent{
    name = Events.InteractionCreate as const
    db: DatabaseService
    commandService:CommandService

    constructor(db: DatabaseService, commandService: CommandService) {
        this.db = db
        this.commandService = commandService
    }

    async execute(interaction: Interaction) {
    if (!interaction.isCommand()) return;

    const command = this.commandService.commands.get(interaction.commandName);
    if (command) {
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `❌ Unable to execute this command: ${error}`, ephemeral: true });
        }
    }
    }
}
