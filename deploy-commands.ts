import { commands, commandService } from "./src/services/initServices"

async function registerGuildCommands() {
    for (const command of commands) {
        commandService.registerCommand(command)
    }

    commandService.putGuildCommands()
}

try {
    registerGuildCommands()
} catch (e) {
    console.log(e)
}
