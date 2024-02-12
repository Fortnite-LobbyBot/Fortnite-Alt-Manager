import { CommandConfigContext } from './CommandConfigContext';
import { CommandRunContext } from './CommandRunContext';
import { SlashCommandBuilder } from 'discord.js';

export interface ICommand {
	id: string;
	config: (ctx: CommandConfigContext) => {
		slash: Omit<
			SlashCommandBuilder,
			| 'addSubcommandGroup'
			| 'addSubcommand'
			| 'addBooleanOption'
			| 'addUserOption'
			| 'addChannelOption'
			| 'addRoleOption'
			| 'addAttachmentOption'
			| 'addMentionableOption'
			| 'addStringOption'
			| 'addIntegerOption'
			| 'addNumberOption'
		>;
		isHidden?: boolean;
	};
	run: (ctx: CommandRunContext) => Promise<any>;
}

export class Command implements ICommand {
	id: string;
	config: (ctx: CommandConfigContext) => {
		slash: Omit<
			SlashCommandBuilder,
			| 'addSubcommandGroup'
			| 'addSubcommand'
			| 'addBooleanOption'
			| 'addUserOption'
			| 'addChannelOption'
			| 'addRoleOption'
			| 'addAttachmentOption'
			| 'addMentionableOption'
			| 'addStringOption'
			| 'addIntegerOption'
			| 'addNumberOption'
		>;
		isHidden?: boolean;
	};
	run: (ctx: CommandRunContext) => Promise<any>;

	constructor(commandOptions: ICommand) {
		this.id = commandOptions.id;
		this.config = commandOptions.config;
		this.run = commandOptions.run;
	}

	getConfig(ctx: CommandConfigContext) {
		return this.config(ctx);
	}
}
