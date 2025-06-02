import { Client, GatewayIntentBits } from "discord.js";
import { BotManager } from "./bot-manager";

async function main() {
  // Create client with required intents
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessages,
    ],
  });

  // Initialize bot manager
  const botManager = new BotManager(client);

  // Start the bot
  await botManager.start();
}

try {
  main();
} catch (e) {
  console.log(e);
}
