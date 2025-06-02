import { Collection, REST, Routes } from "discord.js";
import type DiscordCommand from "../interfaces/discord-command";
import type { DatabaseService } from "../db/db";
import PingCommand from "../commands/ping-command";
import SetWelcomeChannel from "../commands/set-welcome-channel";
import SetWelcomeRole from "../commands/set-welcome-role";
import type { Environment } from "../interfaces/enviroment";

export default class CommandService {
  commands: Collection<string, DiscordCommand>;
  commandsJSON: any[];
  env: Environment;
  db: DatabaseService;

  constructor(env: Environment, db: DatabaseService) {
    this.commands = new Collection<string, DiscordCommand>();
    this.commandsJSON = [];
    this.env = env;
    this.db = db;
  }

  async init() {
    this.registerCommands([
      new PingCommand(),
      new SetWelcomeChannel(this.db),
      new SetWelcomeRole(this.db),
    ]);

    await this.refreshAllGuildCommands();
  }

  registerCommands(commands: DiscordCommand[]) {
    for (const command of commands) {
      this.commands.set(command.data.name, command);
      this.commandsJSON.push(command.data.toJSON());
    }
  }

  async refreshAllGuildCommands() {
    const rest = new REST().setToken(this.env.botToken);

    const guilds = this.db.getGuilds();

    for (const guild of guilds) {
      const data = (await rest.put(
        Routes.applicationGuildCommands(this.env.appId, guild.id),
        {
          body: this.commandsJSON,
        }
      )) as any;
      console.log(
        `[GUILD] Successfully reloaded ${data.length} application (/) commands.`
      );
    }
  }
}
