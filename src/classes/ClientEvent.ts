import type { ClientEvents } from 'discord.js';
import { EventContext } from './EventContext';

export interface IClientEvent<Name extends keyof ClientEvents> {
	name: Name;
	once: boolean;

	run: (ctx: EventContext, ...args: ClientEvents[Name]) => Promise<unknown>;
}

export class ClientEvent<Name extends keyof ClientEvents> implements IClientEvent<Name> {
	name: Name;
	once: boolean;

	run: (ctx: EventContext, ...args: ClientEvents[Name]) => Promise<unknown>;
	constructor(event: IClientEvent<Name>) {
		this.name = event.name;
		this.once = event.once;

		this.run = event.run;
	}
}
