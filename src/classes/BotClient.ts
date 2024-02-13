import { ClientUtil } from './ClientUtil';
import { Client, REST, Routes } from 'discord.js';
import { CommandManager } from '../managers/commandManager';
import { EventHandler } from '../handlers/eventHandler';
import { EventManager } from '../managers/eventManager';
import { AltManager } from '../managers/altManager';

export interface Alt {
	userId: string;
	name: string;
	status: AltStatus;
	timestamp: number;
	private?: boolean;
}

export enum AltStatus {
	Online = 0,
	Busy = 1,
	Idle = 2,
	Offline = 3,
}

export class BotClient extends Client {
	util = new ClientUtil();

	eventHandler = new EventHandler(this);

	managers = {
		altManager: new AltManager(this),
		commandManager: new CommandManager(),
		eventManager: new EventManager(),
	};

	alts = new Map<string, Alt[]>();

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
