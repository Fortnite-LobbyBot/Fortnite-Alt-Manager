import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import type { ClientEvents } from 'discord.js';
import type { IClientEvent } from '../classes/ClientEvent';

export class EventManager {
	getEvents() {
		const events: IClientEvent<keyof ClientEvents>[] = [];

		function searchEvent(path: string) {
			const eventsPath = join(__dirname, path);
			const eventsNames = existsSync(eventsPath) ? readdirSync(eventsPath) : [];

			for (const eventName of eventsNames) {
				if (eventName.includes('.event')) {
					const {
						default: event
					}: {
						default: IClientEvent<keyof ClientEvents>;
					} = require(join(eventsPath, eventName));

					events.push(event);
				} else {
					searchEvent(`${path}${eventName}/`);
				}
			}
		}

		searchEvent('../events/');

		return events;
	}

	findEvent(predicate: (event: IClientEvent<keyof ClientEvents>) => boolean) {
		return this.getEvents().find(predicate);
	}
}
