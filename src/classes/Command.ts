import { type SlashCommandOptionsOnlyBuilder, type SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import type { BotClient } from './BotClient';
import type { CommandConfigContext } from './CommandConfigContext';
import type { CommandHandleRunContext } from './CommandHandleRunContext';
import type {
	HandleAutocompleteInteractionContext,
	HandleComponentInteractionContext,
	HandleContextMenuInteractionContext,
	HandleInteractionContext,
	HandleModalSubmitInteractionContext,
} from './HandleInteractionContext';

export interface ICommand {
	readonly id: string;
	readonly client: BotClient;

	getConfig(ctx: CommandConfigContext): {
		slash: SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
		isHidden?: boolean;
	};

	handleRun(ctx: CommandHandleRunContext): Promise<any>;

	handleAutocompleteInteraction?(
		ctx: HandleAutocompleteInteractionContext,
	): Promise<any>;

	handleContextMenuInteraction?(
		ctx: HandleContextMenuInteractionContext,
	): Promise<any>;

	handleModalSubmitInteraction?(
		ctx: HandleModalSubmitInteractionContext,
	): Promise<any>;

	handleComponentInteraction?(
		ctx: HandleComponentInteractionContext,
	): Promise<any>;
}

export abstract class Command implements ICommand {
	public abstract readonly id: string;
	public readonly client: BotClient;

	public constructor(client: BotClient) {
		this.client = client;
	}

	public abstract getConfig(ctx: CommandConfigContext): {
		slash: SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
		isHidden?: boolean;
	};

	public abstract handleRun(ctx: CommandHandleRunContext): Promise<any>;

	public handleInteraction?(ctx: HandleInteractionContext): Promise<any>;

	public handleAutocompleteInteraction?(
		ctx: HandleAutocompleteInteractionContext,
	): Promise<any>;

	public handleContextMenuInteraction?(
		ctx: HandleContextMenuInteractionContext,
	): Promise<any>;

	public handleModalSubmitInteraction?(
		ctx: HandleModalSubmitInteractionContext,
	): Promise<any>;

	public handleComponentInteraction?(
		ctx: HandleComponentInteractionContext,
	): Promise<any>;
}
