import { Client, Events } from "discord.js";
import type DiscordEvent from "../interfaces/discord-event";

export default class Ready implements DiscordEvent {
  name = Events.ClientReady as const;
once = true

  async execute(client: Client) {
    console.log(`Ready! Logged in as ${client.user!.tag}`);
  }
}
