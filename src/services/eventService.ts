import type { Client, ClientEvents } from "discord.js";
import type DiscordEvent from "../interfaces/IDiscordEvent";
import type { DatabaseService } from "../db/db";
import type CommandService from "./commandService";
import Ready from "../events/ready";
import GuildMemberAdd from "../events/guildMemberAdd";
import InteractionCreate from "../events/interactionCreate";
import GuildCreate from "../events/guildCreate";

export default class EventService {
  private events: DiscordEvent[] = [];
  private client: Client;
  private db: DatabaseService;
  private commandService: CommandService;

  constructor(
    client: Client,
    db: DatabaseService,
    commandService: CommandService
  ) {
    this.client = client;
    this.db = db;
    this.commandService = commandService;
  }

  async init() {
    this.registerEvents([
      new Ready(),
      new GuildMemberAdd(this.db),
      new GuildCreate(this.db),
      new InteractionCreate(this.db, this.commandService),
    ]);

    for (const event of this.events) {
      if (event.once) {
        this.client.once(event.name, (...args) => event.execute(...args));
      } else {
        this.client.on(event.name, (...args) => event.execute(...args));
      }
    }
  }

  registerEvents<K extends keyof ClientEvents>(
    events: DiscordEvent<K>[]
  ): void {
    this.events = [...this.events, ...events];
  }
}
