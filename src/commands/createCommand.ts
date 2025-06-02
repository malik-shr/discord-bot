import {
    ChatInputCommandInteraction,
    InteractionResponse,
    PermissionFlagsBits,
    Routes,
    SlashCommandBuilder,
} from "discord.js"
import type DiscordCommand from "../interfaces/IDiscordCommand"
import type { DatabaseService } from "../db/db"
import type CommandService from "../services/commandService"
import CustomCommand from "./customCommand"

export default class CreateCommand implements DiscordCommand {
    private db: DatabaseService
    private commandService: CommandService

    constructor(db: DatabaseService, commandService: CommandService) {
        this.db = db
        this.commandService = commandService
    }

    data = new SlashCommandBuilder()
        .setName("command")
        .setDescription("Manage custom commands")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((sub) =>
            sub
                .setName("create")
                .setDescription("Create a new custom command")
                .addStringOption((opt) =>
                    opt.setName("name").setDescription("Command name").setRequired(true)
                )
                .addStringOption((opt) =>
                    opt.setName("response").setDescription("Command response").setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName("delete")
                .setDescription("Delete a custom command")
                .addStringOption((opt) =>
                    opt.setName("name").setDescription("Command name").setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub.setName("list").setDescription("List all custom commands")
        ) as DiscordCommand["data"]

    async execute(interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean>> {
        const subcommand = interaction.options.getSubcommand(true)

        const guild = interaction.guild
        if (!guild) {
            return interaction.reply({
                content: "No guild!",
                ephemeral: true,
            })
        }

        if (subcommand === "create") {
            const name = interaction.options.getString("name", true)
            const response = interaction.options.getString("response", true)

            this.db.insertCommand({
                guild_id: guild.id,
                name: name,
                response: response,
            })
            this.commandService.refreshAllGuildCommands()

            return interaction.reply({
                content: `Successfully created new Command /${name} -> ${response}`,
                ephemeral: true,
            })
        } else if (subcommand === "delete") {
            const name = interaction.options.getString("name", true)

            this.db.deleteCommand(guild.id, name)
            this.commandService.removeCommand(guild.id, name)

            return interaction.reply({
                content: `Successfully Deleted command ${name}`,
                ephemeral: true,
            })
        } else if (subcommand === "list") {
            let content = "All custom commands\n"
            const commands = this.db.getCommands(guild.id)

            for (const command of commands) {
                content += `- /${command.name} -> ${command.response}\n`
            }

            return interaction.reply({
                content: content,
                ephemeral: true,
            })
        }
        return interaction.reply({
            content: "Unknown subcommand",
            ephemeral: true,
        })
    }
}
