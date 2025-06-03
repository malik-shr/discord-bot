import { Events, type GuildMember } from "discord.js"
import type DiscordEvent from "../interfaces/IDiscordEvent"
import { db } from "../services/initServices"

export default class GuildMemberAdd implements DiscordEvent {
    name = Events.GuildMemberAdd as const

    async execute(member: GuildMember) {
        let welcomeRole = db.getWelcomeRole(member.guild.id)
        let welcomeChannel = db.getWelcomeChannel(member.guild.id)

        if (!welcomeRole || !welcomeChannel) {
            return
        }

        const role = await member.guild.roles.cache.find((role) => role.id === welcomeRole.role_id)
        if (role) {
            await member.roles.add(role)
        }

        const channel = await member.guild.channels.cache.find(
            (channel) => channel.id === welcomeChannel.channel_id
        )
        if (channel && channel.isTextBased()) {
            await channel.fetch()
            channel.send(`${member.user} ist dem Server beigetreten!`)
        }
    }
}
