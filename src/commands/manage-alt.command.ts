import {
	ActionRowBuilder,
	type AnySelectMenuInteraction,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder
} from 'discord.js';
import { BotClient } from '../classes/BotClient';
import { Command } from '../classes/Command';
import { CommandHandleRunContext } from '../classes/CommandHandleRunContext';
import type { HandleComponentInteractionContext } from '../classes/HandleInteractionContext';
import { CommandMentions, Emojis } from '../constants';
import { type Alt, AltStatus } from '../types/Alt';

enum CustomId {
	PanelOnline = '0',
	PanelBusy = '1',
	PanelIdle = '2',
	PanelOffline = '3'
}

export default class ManageAltCommand extends Command {
	id = 'manage-alt';

	getConfig() {
		return {
			slash: new SlashCommandBuilder()
				.setName(this.id)
				.setDescription('Manage your alts.')
				.addSubcommand((c) =>
					c.setName('panel').setDescription('Shows an interactive panel for managing your alt')
				)
				.addSubcommand((c) => c.setName('set-online').setDescription('Set your alt as online'))
				.addSubcommand((c) => c.setName('set-busy').setDescription('Set your alt as busy'))
				.addSubcommand((c) => c.setName('set-idle').setDescription('Set your alt as idle'))
				.addSubcommand((c) => c.setName('set-offline').setDescription('Set your alt as offline'))
				.addSubcommand((c) => c.setName('remove-alt').setDescription('Removes your alt from the system'))
		};
	}

	async handleRun({ interaction }: CommandHandleRunContext) {
		const client = this.client;

		const subcommand = interaction.options.getSubcommand(true);

		const currentGuildId = interaction.guildId;

		const userAlt = client.alts.get(currentGuildId)?.findLast((a) => a.userId === interaction.user.id);

		if (!userAlt)
			return interaction.reply({
				content: `You need to publish an alt first. Use the command: ${CommandMentions.PublishAlt}.`,
				ephemeral: true
			});

		switch (subcommand) {
			case 'panel': {
				if (!userAlt) return;

				return interaction.reply({
					embeds: [ManageAltCommand.getAltPanelEmbed(this.client, userAlt, userAlt.status)],
					components: [ManageAltCommand.getAltPanelComponents(client, userAlt.status)],
					ephemeral: true
				});
			}

			case 'set-online':
				await ManageAltCommand.updateAltStatus(
					this.client,
					currentGuildId,
					AltStatus.Online,
					userAlt,
					interaction
				);

				break;
			case 'set-busy':
				await ManageAltCommand.updateAltStatus(
					this.client,
					currentGuildId,
					AltStatus.Busy,
					userAlt,
					interaction
				);

				break;
			case 'set-idle':
				await ManageAltCommand.updateAltStatus(
					this.client,
					currentGuildId,
					AltStatus.Idle,
					userAlt,
					interaction
				);

				break;
			case 'set-offline':
				await ManageAltCommand.updateAltStatus(
					this.client,
					currentGuildId,
					AltStatus.Offline,
					userAlt,
					interaction
				);

				break;
			case 'remove-alt':
				client.managers.altManager.removeAlt(currentGuildId, interaction.user.id);

				return interaction.reply({
					content: 'Alt removed successfully.',
					ephemeral: true
				});
		}
	}

	public static updateAltStatus(
		client: BotClient,
		guildId: string | null,
		status: AltStatus,
		alt: Alt,
		interaction: ChatInputCommandInteraction | ButtonInteraction | AnySelectMenuInteraction
	) {
		client.managers.altManager.setStatus(guildId, alt, status);

		return interaction.reply({
			embeds: [ManageAltCommand.getAltStatusEmbed(client, status, alt)]
		});
	}

	public static getAltStatusEmbed(client: BotClient, status: AltStatus, alt: Alt) {
		const { color: embedColor, emoji: embedEmoji } = client.managers.altManager.getStatus(status);

		return new EmbedBuilder()
			.setColor(embedColor)
			.setDescription(
				`${embedEmoji} The alt ${Emojis.Epic} ${client.util.toBold(
					alt.name
				)} by <@${alt.userId}> is now: **${AltStatus[status]}**`
			);
	}

	public static getAltPanelEmbed(client: BotClient, alt: Alt, status: AltStatus) {
		const { color: embedColor, emoji: embedEmoji } = client.managers.altManager.getStatus(status);

		return new EmbedBuilder()
			.setColor(embedColor)
			.setDescription(
				`${embedEmoji} The alt ${Emojis.Epic} ${client.util.toBold(
					alt.name
				)} is currently: ${client.util.toBold(AltStatus[status])}\n\n> ${Emojis.User} External accounts: ${
					client.managers.altManager.getExternalAuths(alt, true) || 'No external accounts associated'
				}\n> ${Emojis.Question} Press the buttons to update the status.`
			);
	}

	public static getAltPanelComponents(client: BotClient, currentStatus: AltStatus, disableAll = false) {
		const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(CustomId.PanelOnline)
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(currentStatus === AltStatus.Online)
				.setEmoji(client.util.getEmojiId(Emojis.Online)),
			new ButtonBuilder()
				.setCustomId(CustomId.PanelBusy)
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(currentStatus === AltStatus.Busy)
				.setEmoji(client.util.getEmojiId(Emojis.Busy)),
			new ButtonBuilder()
				.setCustomId(CustomId.PanelIdle)
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(currentStatus === AltStatus.Idle)
				.setEmoji(client.util.getEmojiId(Emojis.Idle)),
			new ButtonBuilder()
				.setCustomId(CustomId.PanelOffline)
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(currentStatus === AltStatus.Offline)
				.setEmoji(client.util.getEmojiId(Emojis.Offline))
		);

		if (disableAll) {
			const newComponents = actionRow.components.map((buttonBuilder) => buttonBuilder.setDisabled(true));

			actionRow.setComponents(newComponents);
		}

		return actionRow;
	}

	public static async handlePanel(client: BotClient, interaction: ButtonInteraction | AnySelectMenuInteraction) {
		let status;

		const currentGuildId = interaction.guildId;

		const userAlt = client.alts.get(currentGuildId)?.findLast((a) => a.userId === interaction.user.id);

		if (!userAlt)
			return interaction.reply({
				content: `You need to publish an alt first. Use the command: ${CommandMentions.PublishAlt}.`,
				ephemeral: true
			});

		switch (interaction.customId) {
			case CustomId.PanelOnline:
				status = AltStatus.Online;
				break;
			case CustomId.PanelBusy:
				status = AltStatus.Busy;
				break;
			case CustomId.PanelIdle:
				status = AltStatus.Idle;
				break;
			case CustomId.PanelOffline:
				status = AltStatus.Offline;
				break;
			default:
				status = AltStatus.Online;
		}

		client.managers.altManager.setStatus(currentGuildId, userAlt, status);

		await interaction.update({
			embeds: [ManageAltCommand.getAltPanelEmbed(client, userAlt, status)],
			components: [ManageAltCommand.getAltPanelComponents(client, status)]
		});

		return interaction.followUp({
			embeds: [ManageAltCommand.getAltStatusEmbed(client, status, userAlt)]
		});
	}

	public override async handleComponentInteraction({ interaction }: HandleComponentInteractionContext): Promise<any> {
		await ManageAltCommand.handlePanel(this.client, interaction);
	}
}
