import { ClientUtil } from './ClientUtil';
import { Client, REST, Routes } from 'discord.js';
import { CommandManager } from '../managers/commandManager';
import { EventHandler } from '../handlers/eventHandler';
import { EventManager } from '../managers/eventManager';

export class BotClient extends Client {
	util = new ClientUtil();

	eventHandler = new EventHandler(this);

	managers = {
		commandManager: new CommandManager(),
		eventManager: new EventManager(),
	};

	alts = new Map<string, Map<string, string>>();

	async setup() {
		this.eventHandler.start();

		const token = process.env.TOKEN as string;

		const rest = new REST().setToken(token);

		await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID ?? ''),
			{
				body: [
					...this.managers.commandManager
						.getCommands()
						.map((cmd) => cmd.getConfig({ client: this }).slash),
				],
			}
		);

		console.log('Posted commands');

		super.login(token);
	}

	async destroy() {
		super.destroy();
	}
}
