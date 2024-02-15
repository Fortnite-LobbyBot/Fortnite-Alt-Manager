import { ClientUtil } from './ClientUtil';
import { Client, REST, Routes } from 'discord.js';
import { CommandManager } from '../managers/commandManager';
import { EventHandler } from '../handlers/eventHandler';
import { EventManager } from '../managers/eventManager';
import { AltManager } from '../managers/altManager';

export interface Alt {
	guildId?: string;
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
	public util = new ClientUtil();

	public eventHandler = new EventHandler(this);

	public managers = {
		altManager: new AltManager(this),
		commandManager: new CommandManager(),
		eventManager: new EventManager(),
	};

	public alts = new Map<string, Alt[]>();

	async setup() {
		const token = process.env['TOKEN'];
		const clientId = process.env['CLIENT_ID'];

		if (!token || !clientId)
			return console.error(
				`${
					token ? 'CLIENT_ID' : 'TOKEN'
				} not specified. Please add it to your .env.${
					process.env['NODE_ENV'] ?? 'development'
				} file`
			);

		super.login(token);

		this.eventHandler.start();

		const commands = this.managers.commandManager.getCommands();

		const rest = new REST().setToken(token);

		await rest.put(Routes.applicationCommands(clientId), {
			body: commands.map((cmd) => cmd.getConfig({ client: this }).slash),
		});

		console.log('Posted', commands.length, 'commands');
	}
}
