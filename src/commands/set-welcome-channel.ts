import {
  ChannelType,
  ChatInputCommandInteraction,
  CommandInteraction,
  InteractionResponse,
  SlashCommandBuilder,
} from "discord.js";
import type DiscordCommand from "../interfaces/discord-command";
import type { DatabaseService } from "../db/db";

export default class SetWelcomeChannel implements DiscordCommand {
  data: SlashCommandBuilder;
  db: DatabaseService;

  constructor(db: DatabaseService) {
    this.db = db;
    this.data = new SlashCommandBuilder()
      .setName("set-welcome-channel")
      .setDescription("Set your welcome channel!")
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("The welcome channel (mention, name, or ID)")
          .setRequired(true)
          .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
      ) as DiscordCommand["data"];
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

    const channelOption = interaction.options.getChannel("channel", true);

    const channel = interaction.guild!.channels.cache.get(channelOption.id);

    if (!channel || !channel.isTextBased()) {
      return interaction.reply({
        content: "Please select a valid text channel for welcome messages!",
        ephemeral: true,
      });
    }

    this.db.insertWelcomeChannel({
      guild_id: interaction.commandGuildId!,
      channel_id: channel.id,
    });
    return interaction.reply({
      content: `${channel} is now set as the welcome channel for this server!`,
      ephemeral: true,
    });
  }
}
