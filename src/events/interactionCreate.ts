import { ChatInputCommandInteraction, Events } from "discord.js"
import type DiscordEvent from "../interfaces/IDiscordEvent"
import { commandService } from "../services/initServices"

export default class InteractionCreate implements DiscordEvent {
    name = Events.InteractionCreate as const

    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.isCommand()) return

        const command = commandService.commands.get(interaction.commandName)

        if (command) {
            try {
                await command.execute(interaction)
            } catch (error) {
                console.error(error)
                await interaction.reply({
                    content: `❌ Unable to execute this command: ${error}`,
                    ephemeral: true,
                })
            }
        }
    }
}
