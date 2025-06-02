import type { ClientEvents } from "discord.js";

export default interface DiscordEvent<K extends keyof ClientEvents = keyof ClientEvents> {
  name: K;
  once?: boolean;
  execute: (...args: any[]) => void | Promise<void>;
}
