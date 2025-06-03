import {
    ChatInputCommandInteraction,
    InteractionResponse,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js"
import type DiscordCommand from "../interfaces/IDiscordCommand"
import { commandService, db } from "../services/initServices"
import Cmd from "../utils/cmd"

export default class CustomCommand implements DiscordCommand {
    data = new SlashCommandBuilder()
        .setName("command")
        .setDescription("Manage custom commands")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((sub) =>
            sub
                .setName("add")
                .setDescription("Add a new custom command")
                .addStringOption((opt) =>
                    opt.setName("name").setDescription("Command name").setRequired(true)
                )
                .addStringOption((opt) =>
                    opt.setName("response").setDescription("Command response").setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName("remove")
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

        if (subcommand === "add") {
            const name = interaction.options.getString("name", true)
            const response = interaction.options.getString("response", true)

            db.insertCommand({
                guild_id: guild.id,
                name: name,
                response: response,
            })
            commandService.registerCommand(new Cmd(name, response))
            commandService.putGuildCommands()

            return interaction.reply({
                content: `Successfully created new Command /${name} -> ${response}`,
                ephemeral: true,
            })
        } else if (subcommand === "remove") {
            const name = interaction.options.getString("name", true)

            db.deleteCommand(guild.id, name)
            commandService.removeGuildCommand(guild.id, name)

            return interaction.reply({
                content: `Successfully Deleted command ${name}`,
                ephemeral: true,
            })
        } else if (subcommand === "list") {
            let content = "All custom commands\n"
            const commands = db.getCommands(guild.id)

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
