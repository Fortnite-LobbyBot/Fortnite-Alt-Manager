import { BotClient } from './BotClient';

export interface ICommandConfigContext {
	client: BotClient;
}

export class CommandConfigContext implements ICommandConfigContext {
	client: BotClient;

	constructor({ client }: ICommandConfigContext) {
		this.client = client;
	}
}
