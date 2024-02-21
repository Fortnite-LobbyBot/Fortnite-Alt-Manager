import { BotClient } from '../classes/BotClient';
import type { Command } from '../classes/Command';

export class CommandHandler {
	private client: BotClient;

	constructor(client: BotClient) {
		this.client = client;
	}

	async setup() {
		const commands = this.client.managers.commandManager.getCommands();

		for (const Cmd of commands) {
			const cmd = new Cmd(this.client) as Command;

			this.client.commands.set(cmd.id, cmd);
		}
	}
}
