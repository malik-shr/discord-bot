import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js"
import type DiscordCommand from "../interfaces/IDiscordCommand"

export default class CustomCommand implements DiscordCommand {
    data: SlashCommandBuilder
    private response: string

    constructor(name: string, response: string) {
        this.response = response
        this.data = new SlashCommandBuilder().setName(name).setDescription("Custom Command")
    }

    async execute(interaction: ChatInputCommandInteraction) {
        return interaction.reply({ content: this.response })
    }
}
