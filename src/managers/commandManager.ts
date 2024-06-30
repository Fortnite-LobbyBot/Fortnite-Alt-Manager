import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { Command } from '../classes/Command';

export class CommandManager {
	getCommands() {
		const commands: any[] = [];

		function searchCommands(path: string) {
			const commandsPath = join(__dirname, path);
			const commandNames = existsSync(commandsPath) ? readdirSync(commandsPath) : [];

			for (const commandName of commandNames) {
				if (commandName.includes('.command')) {
					const {
						default: command
					}: {
						default: typeof Command;
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

	findCommand(predicate: (command: any) => boolean) {
		return this.getCommands().find(predicate);
	}
}
