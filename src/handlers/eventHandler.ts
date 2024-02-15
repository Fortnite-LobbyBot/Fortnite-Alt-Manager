import { BotClient } from '../classes/BotClient';

export class EventHandler {
	private client: BotClient;

	constructor(client: BotClient) {
		this.client = client;
	}

	async start() {
		const events = this.client.managers.eventManager.getEvents();

		for (const event of events) {
			const name = event.name;

			const eventListener = async <Args extends []>(...args: Args) => {
				await event
					.run(
						{
							client: this.client,
						},
						...args
					)
					.catch((err) => console.error('Event failed:', err));
			};

			this.client[event.once ? 'once' : 'on'](name, eventListener);
		}
	}
}
