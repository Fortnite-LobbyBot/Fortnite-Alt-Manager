import { join } from 'path';
import { readdirSync, existsSync } from 'fs';
import { Command } from '../classes/Command';

export class CommandManager {
	getCommands(): Command[] {
		const commands: Command[] = [];

		function searchCommands(path: string) {
			const commandsPath = join(__dirname, path);
			const commandNames = existsSync(commandsPath)
				? readdirSync(commandsPath)
				: [];

			for (const commandName of commandNames) {
				if (commandName.includes('.command')) {
					const {
						default: command,
					}: {
						default: Command;
					} = require(join(commandsPath, commandName));

					commands.push(command);
				} else {
					searchCommands(`${path}${commandName}/`);
				}
			}
		}

		searchCommands('../commands/');

		return commands;
	}

	getCommand(predicate: (command: Command) => boolean): Command | undefined {
		return this.getCommands().find(predicate);
	}
}
