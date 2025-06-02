import {
  ChatInputCommandInteraction,
  CommandInteraction,
  InteractionResponse,
  SlashCommandBuilder,
} from 'discord.js';
import type DiscordCommand from '../interfaces/discord-command';
import type { DatabaseService } from '../db/db';

export default class SetWelcomeRole implements DiscordCommand {
  data: SlashCommandBuilder 
  db: DatabaseService

    constructor(db: DatabaseService) {
      this.db = db
    this.data = new SlashCommandBuilder()
        .setName('set-welcome-role')
        .setDescription('Set your welcome Role!')
      .addRoleOption((option) =>
        option
          .setName("role")
          .setDescription("The welcome role (mention, name, or ID)")
          .setRequired(true)
        ) as DiscordCommand["data"]
    }

  async execute(
    interaction: ChatInputCommandInteraction | CommandInteraction
  ): Promise<InteractionResponse<boolean>> {
        if (!interaction.isChatInputCommand()) {
      return interaction.reply({
        content: "This command only supports slash commands!",
        ephemeral: true,
      });
    }

    const roleOption = interaction.options.getRole("role", true);
    const role = interaction.guild!.roles.cache.get(roleOption.id);

        if (!role) {
      return interaction.reply({
        content: "Please select a valid role for the welcome role!",
        ephemeral: true,
      });
    }

    this.db.insertWelcomeRole({guild_id: interaction.commandGuildId!, role_id:role.id!})
    return interaction.reply({
      content: `${role} is now set as the welcome role for this server!`,
      ephemeral: true,
    });  }
}