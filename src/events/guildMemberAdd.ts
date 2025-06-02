import { Events, type ClientEvents, type GuildMember } from "discord.js"
import type { DatabaseService } from "../db/db"
import type DiscordEvent from "../interfaces/discord-event"

export default class GuildMemberAdd implements DiscordEvent{
    name = Events.GuildMemberAdd as const
    db: DatabaseService

    constructor(db: DatabaseService) {
        this.db = db
    }

    async execute(member: GuildMember) {
        let welcomeRole = this.db.getWelcomeRole(member.guild.id)
        let welcomeChannel = this.db.getWelcomeChannel(member.guild.id)

        if(!welcomeRole || !welcomeChannel) {
            return
        }

        const role = await member.guild.roles.cache.find(role => role.id === welcomeRole.role_id)
        if(role) {
            await member.roles.add(role)
        }

        const channel = await member.guild.channels.cache.find(channel => channel.id === welcomeChannel.channel_id)
        if(channel && channel.isTextBased()) {
            await channel.fetch()
            channel.send(`${member.user} ist dem Server beigetreten!`)
        }
    }
}
