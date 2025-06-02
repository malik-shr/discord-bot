import { ChatInputCommandInteraction, InteractionResponse, SlashCommandBuilder } from "discord.js"
import type DiscordCommand from "../interfaces/IDiscordCommand"

export default class Ping implements DiscordCommand {
    data = new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong! 🏓")

    async execute(interaction: ChatInputCommandInteraction) {
        return interaction.reply({ content: "Pong! 🏓", ephemeral: true })
    }
}
