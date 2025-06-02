import { Client, Events } from "discord.js"
import type DiscordEvent from "../interfaces/IDiscordEvent"

export default class Ready implements DiscordEvent {
    name = Events.ClientReady as const
    once = true

    async execute(client: Client) {
        console.log(`Ready! Logged in as ${client.user!.tag}`)
    }
}
