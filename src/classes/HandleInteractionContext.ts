import type {
	AnySelectMenuInteraction,
	AutocompleteInteraction,
	ButtonInteraction,
	Interaction,
	MessageContextMenuCommandInteraction,
	ModalSubmitInteraction,
	UserContextMenuCommandInteraction
} from 'discord.js';

export interface IHandleInteractionContext {
	readonly interaction: Interaction;
}

export class HandleInteractionContext implements IHandleInteractionContext {
	public readonly interaction: Interaction;

	constructor(ctx: IHandleInteractionContext) {
		this.interaction = ctx.interaction;
	}
}

export interface IHandleContextMenuInteractionContext extends IHandleInteractionContext {
	readonly interaction: MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction;
}

export class HandleContextMenuInteractionContext
	extends HandleInteractionContext
	implements IHandleContextMenuInteractionContext
{
	public override readonly interaction: MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction;

	constructor(ctx: IHandleContextMenuInteractionContext) {
		super(ctx);
		this.interaction = ctx.interaction;
	}
}

export interface IHandleAutocompleteInteractionContext extends IHandleInteractionContext {
	readonly interaction: AutocompleteInteraction;
}

export class HandleAutocompleteInteractionContext
	extends HandleInteractionContext
	implements IHandleAutocompleteInteractionContext
{
	public override readonly interaction: AutocompleteInteraction;

	constructor(ctx: IHandleAutocompleteInteractionContext) {
		super(ctx);
		this.interaction = ctx.interaction;
	}
}

export interface IHandleModalSubmitInteractionContext extends IHandleInteractionContext {
	readonly interaction: ModalSubmitInteraction;
}

export class HandleModalSubmitInteractionContext
	extends HandleInteractionContext
	implements IHandleModalSubmitInteractionContext
{
	public override readonly interaction: ModalSubmitInteraction;

	constructor(ctx: IHandleModalSubmitInteractionContext) {
		super(ctx);
		this.interaction = ctx.interaction;
	}
}

export interface IHandleComponentInteractionContext extends IHandleInteractionContext {
	readonly interaction: AnySelectMenuInteraction | ButtonInteraction;
}

export class HandleComponentInteractionContext
	extends HandleInteractionContext
	implements IHandleComponentInteractionContext
{
	public override readonly interaction: AnySelectMenuInteraction | ButtonInteraction;

	constructor(ctx: IHandleComponentInteractionContext) {
		super(ctx);
		this.interaction = ctx.interaction;
	}
}
