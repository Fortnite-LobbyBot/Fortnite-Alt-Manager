import { ClientUtil } from './ClientUtil';
import { Client, REST, Routes } from 'discord.js';
import { CommandManager } from '../managers/commandManager';
import { EventHandler } from '../handlers/eventHandler';
import { EventManager } from '../managers/eventManager';
import { AltManager } from '../managers/altManager';
import type { Command } from './Command';
import { CommandHandler } from '../handlers/commandHandler';
import { AltStatus, type Alt } from '../types/Alt';

export class BotClient extends Client {
	public util = new ClientUtil();

	public managers = {
		altManager: new AltManager(this),
		commandManager: new CommandManager(),
		eventManager: new EventManager(),
	};

	public commands = new Map<string, Command>();

	public alts = new Map<string | null, Alt[]>();

	public cooldowns = new Map<string, number>();

	private eventHandler = new EventHandler(this);

	private commandHandler = new CommandHandler(this);

	async setup() {
		const token = process.env['TOKEN'];
		const clientId = process.env['CLIENT_ID'];

		if (!token || !clientId)
			return console.error(
				`${token ? 'CLIENT_ID' : 'TOKEN'
				} not specified. Please add it to your .env.${process.env['NODE_ENV'] ?? 'development'
				} file`,
			);

		await super.login(token);

		this.eventHandler.setup();

		this.commandHandler.setup();

		const commands = [...this.commands.values()];

		const rest = new REST().setToken(token);

		await rest.put(Routes.applicationCommands(clientId), {
			body: commands.map((cmd) => cmd.getConfig({}).slash),
		});

		console.log('Posted', commands.length, 'commands');


		setInterval(() => {
			console.log('Doing alts cleanup...');

			let cc = 0

			for (const [guildId, alts] of this.alts)
				for (const alt of alts) {
					if (alt.timestamp < (Date.now() - 3_600_000)) {
						this.managers.altManager.setStatus(guildId, alt, AltStatus.Offline);
						cc++
					}
				}

			console.log(`Cleaned ${cc} online alts.`);
		}, 30_000)
	}
}
