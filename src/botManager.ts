import type { Client } from "discord.js";
import { DatabaseService } from "./db/db";
import CommandService from "./services/commandService";
import EventService from "./services/eventService";
import type { Environment } from "./interfaces/IEnviroment";

export class BotManager {
  private client: Client;
  private db: DatabaseService;
  private eventService: EventService;
  private commandService: CommandService;
  private env: Environment;

  constructor(client: Client) {
    this.client = client;
    this.env = this.validateEnvironment();
    this.db = new DatabaseService("./data/bot.sqlite");
    this.commandService = new CommandService(this.env, this.db);
    this.eventService = new EventService(client, this.db, this.commandService);
  }

  async start(): Promise<void> {
    try {
      await this.commandService.init();
      await this.eventService.init();

      await this.client.login(this.env.botToken);

      console.log("Bot started successfully!");
    } catch (error) {
      console.error("Failed to start bot:", error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    console.log("Shutting down bot...");
    this.client.destroy();
  }

  validateEnvironment(): Environment {
    const botToken = process.env.BOT_TOKEN;
    const appId = process.env.APP_ID;

    if (!botToken) {
      throw new Error("BOT_TOKEN environment variable is required");
    }

    if (!appId) {
      throw new Error("APP_ID environment variable is required");
    }

    return { botToken, appId };
  }
}
