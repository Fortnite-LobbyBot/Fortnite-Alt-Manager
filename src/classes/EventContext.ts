import { BotClient } from './BotClient';

export interface IEventContext {
	client: BotClient;
}

export class EventContext implements IEventContext {
	client: BotClient;

	constructor(eventContext: IEventContext) {
		this.client = eventContext.client;
	}
}
