import { ChatInputCommandInteraction } from 'discord.js';

export interface ICommandHandleRunContext {
	readonly interaction: ChatInputCommandInteraction;
}

export class CommandHandleRunContext implements ICommandHandleRunContext {
	public readonly interaction: ChatInputCommandInteraction;

	constructor({ interaction }: ICommandHandleRunContext) {
		this.interaction = interaction;
	}
}
