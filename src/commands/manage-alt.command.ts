import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import { Command } from '../classes/Command';
import { CommandHandleRunContext } from '../classes/CommandHandleRunContext';
import { BotClient } from '../classes/BotClient';
import { AltStatus, type Alt } from '../types/Alt';

export default class ManageAltCommand extends Command {
	id = 'manage-alt';

	getConfig() {
		return {
			slash: new SlashCommandBuilder()
				.setName('manage-alt')
				.setDescription('Manage your alts.')
				.addSubcommand((c) =>
					c
						.setName('panel')
						.setDescription(
							'Shows an interactive panel for managing your alt',
						),
				)
				.addSubcommand((c) =>
					c
						.setName('set-online')
						.setDescription('Set your alt as online'),
				)
				.addSubcommand((c) =>
					c
						.setName('set-busy')
						.setDescription('Set your alt as busy'),
				)
				.addSubcommand((c) =>
					c
						.setName('set-idle')
						.setDescription('Set your alt as idle'),
				)
				.addSubcommand((c) =>
					c
						.setName('set-offline')
						.setDescription('Set your alt as offline'),
				)
				.addSubcommand((c) =>
					c
						.setName('remove-alt')
						.setDescription('Removes your alt from the system'),
				),
		};
	}

	async handleRun({ interaction }: CommandHandleRunContext) {
		const client = this.client;

		const subcommand = interaction.options.getSubcommand(true);

		const currentGuildId = interaction.guildId;

		const userAlt = client.alts
			.get(currentGuildId)
			?.findLast((a) => a.userId === interaction.user.id);

		if (subcommand !== 'add-alt' && !userAlt)
			return interaction.reply({
				content:
					'You need to add an alt first. Add it with: </manage-alt add-alt:1206685461246910474>.',
				ephemeral: true,
			});

		const updateAltStatus = (status: AltStatus, alt = userAlt) => {
			if (!alt) return;

			client.managers.altManager.setStatus(currentGuildId, alt, status);

			return interaction.reply({
				embeds: [
					ManageAltCommand.getAltStatusEmbed(
						this.client,
						status,
						alt,
					),
				],
			});
		};

		switch (subcommand) {
			case 'panel': {
				if (!userAlt) return;

				return interaction.reply({
					embeds: [
						ManageAltCommand.getAltPanelEmbed(
							this.client,

							userAlt,
						),
					],
				});
			}

			case 'set-online':
				await updateAltStatus(AltStatus.Online);

				break;
			case 'set-busy':
				await updateAltStatus(AltStatus.Busy);

				break;
			case 'set-idle':
				await updateAltStatus(AltStatus.Idle);

				break;
			case 'set-offline':
				await updateAltStatus(AltStatus.Offline);

				break;
			case 'remove-alt':
				client.managers.altManager.removeAlt(
					currentGuildId,
					interaction.user.id,
				);

				return interaction.reply({
					content: 'Alt removed successfully.',
					ephemeral: true,
				});
		}
	}

	public static getAltStatusEmbed(
		client: BotClient,
		status: AltStatus,
		alt: Alt,
	) {
		const { color: embedColor, emoji: embedEmoji } =
			client.managers.altManager.getStatus(status);

		return new EmbedBuilder()
			.setColor(embedColor)
			.setDescription(
				`${embedEmoji} The alt ${client.util.toCode(
					alt.name,
				)} is now: **${AltStatus[status]}**`,
			);
	}

	public static getAltPanelEmbed(client: BotClient, alt: Alt) {
		const { color: embedColor, emoji: embedEmoji } =
			client.managers.altManager.getStatus(alt.status);

		return new EmbedBuilder()
			.setColor(embedColor)
			.setDescription(
				`${embedEmoji} The alt ${client.util.toCode(
					alt.name,
				)} is now: **${AltStatus[alt.status]}**`,
			);
	}
}
