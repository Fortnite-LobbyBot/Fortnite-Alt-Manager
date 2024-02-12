import { ChatInputCommandInteraction } from 'discord.js';
import { BotClient } from './BotClient';

export interface ICommandRunContext {
	client: BotClient;
	interaction: ChatInputCommandInteraction;
}

export class CommandRunContext implements ICommandRunContext {
	client: BotClient;
	interaction: ChatInputCommandInteraction;

	constructor({ client, interaction }: ICommandRunContext) {
		this.client = client;
		this.interaction = interaction;
	}
}
