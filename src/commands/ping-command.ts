import {
  ChatInputCommandInteraction,
  CommandInteraction,
  InteractionResponse,
  SlashCommandBuilder,
} from 'discord.js';
import type DiscordCommand from '../interfaces/discord-command';

export default class PingCommand implements DiscordCommand {
  data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong! 🏓');

  async execute(
    interaction: ChatInputCommandInteraction | CommandInteraction
  ): Promise<InteractionResponse<boolean>> {
    return interaction.reply({ content: 'Pong! 🏓', ephemeral: true });
  }
}