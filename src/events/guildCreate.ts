import { Events, Guild } from "discord.js"
import type DiscordEvent from "../interfaces/IDiscordEvent"
import { db } from "../services/initServices"

export default class GuildCreate implements DiscordEvent {
    name = Events.GuildCreate as const

    async execute(guild: Guild) {
        try {
            console.log(`Joined new guild: ${guild.name} (${guild.id})`)

            // Save guild to DB
            await db.addGuild({
                id: guild.id,
                name: guild.name,
            })

            console.log(`Guild ${guild.id} saved to DB.`)
        } catch (err) {
            console.error("Error saving guild to DB:", err)
        }
    }
}
