import { Database } from "bun:sqlite"

type Guild = { id: string; name: string }
type WelcomeChannel = { guild_id: string; channel_id: string }
type WelcomeRole = { guild_id: string; role_id: string }
type Command = { guild_id: string; name: string; response: string }

export class DatabaseService {
    db: Database

    constructor(src: string) {
        this.db = new Database(src)
        this.init()
    }

    init() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS welcome_channels(
        guild_id TEXT PRIMARY KEY NOT NULL,
        channel_id TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS welcome_roles(
        guild_id TEXT PRIMARY KEY NOT NULL,
        role_id TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS commands(
        guild_id TEXT NOT NULL,
        name TEXT NOT NULL,
        response TEXT NOT NULL,

        PRIMARY KEY(guild_id, name)
      );
      CREATE TABLE IF NOT EXISTS guilds(
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL
      );
    `)
    }

    insertWelcomeChannel(welcomeChannel: WelcomeChannel) {
        this.db
            .query(`INSERT OR REPLACE INTO welcome_channels (guild_id, channel_id) VALUES (?, ?)`)
            .run(welcomeChannel.guild_id, welcomeChannel.channel_id)
    }

    insertWelcomeRole(welcomeRole: WelcomeRole) {
        this.db
            .query(`INSERT OR REPLACE INTO welcome_roles (guild_id, role_id) VALUES (?, ?)`)
            .run(welcomeRole.guild_id, welcomeRole.role_id)
    }

    insertCommand(command: Command) {
        this.db
            .query(`INSERT OR REPLACE INTO commands (guild_id, name, response) VALUES (?, ?, ?)`)
            .run(command.guild_id, command.name, command.response)
    }

    getCommands(guild_id: string) {
        return this.db
            .query<Command, any>(`SELECT guild_id, name, response FROM commands WHERE guild_id = ?`)
            .all(guild_id)
    }

    deleteCommand(guild_id: string, name: string) {
        this.db.query(`DELETE FROM commands WHERE guild_id = ? AND name = ?`).run(guild_id, name)
    }

    getWelcomeRole(guild_id: string) {
        return this.db
            .query<WelcomeRole, any>(
                `SELECT guild_id, role_id FROM welcome_roles WHERE guild_id = ?`
            )
            .get(guild_id)
    }

    getWelcomeChannel(guild_id: string) {
        return this.db
            .query<WelcomeChannel, any>(
                `SELECT guild_id, channel_id FROM welcome_channels WHERE guild_id = ?`
            )
            .get(guild_id)
    }

    addGuild(guild: Guild) {
        this.db
            .query(`INSERT OR IGNORE INTO guilds (id, name) VALUES (?, ?)`)
            .run(guild.id, guild.name)
    }

    getGuilds(): Guild[] {
        return this.db.query<Guild, any>(`SELECT id, name FROM guilds`).all()
    }
}
