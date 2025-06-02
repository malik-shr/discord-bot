import {
    ChannelType,
    ChatInputCommandInteraction,
    InteractionResponse,
    SlashCommandBuilder,
} from "discord.js"
import type DiscordCommand from "../interfaces/IDiscordCommand"
import type { DatabaseService } from "../db/db"

export default class Set implements DiscordCommand {
    data: SlashCommandBuilder
    private db: DatabaseService

    constructor(db: DatabaseService) {
        this.db = db
        this.data = new SlashCommandBuilder()
            .setName("set")
            .setDescription("Set your welcome channel!")
            .addSubcommand((sub) =>
                sub
                    .setName("welcome-channel")
                    .setDescription("Set your welcome channel!")
                    .addChannelOption((option) =>
                        option
                            .setName("channel")
                            .setDescription("The welcome channel (mention, name, or ID)")
                            .setRequired(true)
                            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                    )
            )
            .addSubcommand((sub) =>
                sub
                    .setName("welcome-role")
                    .setDescription("Set your welcome Role!")
                    .addRoleOption((option) =>
                        option
                            .setName("role")
                            .setDescription("The welcome role (mention, name, or ID)")
                            .setRequired(true)
                    )
            ) as DiscordCommand["data"]
    }

    async execute(interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean>> {
        const subcommand = interaction.options.getSubcommand(true)

        if (subcommand === "welcome-channel") {
            const channelOption = interaction.options.getChannel("channel", true)

            const channel = interaction.guild!.channels.cache.get(channelOption.id)

            if (!channel || !channel.isTextBased()) {
                return interaction.reply({
                    content: "Please select a valid text channel for welcome messages!",
                    ephemeral: true,
                })
            }

            this.db.insertWelcomeChannel({
                guild_id: interaction.commandGuildId!,
                channel_id: channel.id,
            })
            return interaction.reply({
                content: `${channel} is now set as the welcome channel for this server!`,
                ephemeral: true,
            })
        } else if (subcommand === "welcome-role") {
            const roleOption = interaction.options.getRole("role", true)
            const role = interaction.guild!.roles.cache.get(roleOption.id)

            if (!role) {
                return interaction.reply({
                    content: "Please select a valid role for the welcome role!",
                    ephemeral: true,
                })
            }

            this.db.insertWelcomeRole({
                guild_id: interaction.commandGuildId!,
                role_id: role.id!,
            })
            return interaction.reply({
                content: `${role} is now set as the welcome role for this server!`,
                ephemeral: true,
            })
        }
        return interaction.reply({
            content: "Unknown subcommand",
            ephemeral: true,
        })
    }
}
