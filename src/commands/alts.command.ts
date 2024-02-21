import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import { Emojis } from '../constants';
import { Command } from '../classes/Command';
import { BotClient } from '../classes/BotClient';
import type { CommandHandleRunContext } from '../classes/CommandHandleRunContext';
import { PaginationBuilder, PaginationManager } from 'pagination-manager';
import { AltStatus, type Alt } from '../types/Alt';

enum CustomId {
	FirstPage = '0',
	PrevPage = '1',
	Reload = '2',
	NextPage = '3',
	LastPage = '4',
}

export default class AltsCommand extends Command {
	id = 'alts';

	getConfig() {
		return {
			slash: new SlashCommandBuilder()
				.setName('alts')
				.setDescription('View the available alts for bot lobbies.')
				.addBooleanOption((o) =>
					o
						.setName('global')
						.setDescription(
							'Display global alts, not only the ones on this server',
						)
						.setRequired(false),
				)
				.addBooleanOption((o) =>
					o
						.setName('ephemeral')
						.setDescription('Only display the command for you')
						.setRequired(false),
				),
		};
	}

	public static getAlts(
		client: BotClient,
		currentGuildId: string | null,
		isGlobal: boolean,
	) {
		const finalAlts: Alt[] = [];

		const guildAlts: Alt[] = client.alts.get(currentGuildId) ?? [];

		if (isGlobal) {
			for (const [guildId, alts] of client.alts)
				if (guildId !== currentGuildId)
					for (const alt of alts)
						if (!alt.private) finalAlts.push({ ...alt, guildId });

			finalAlts.sort((a, b) => a.timestamp - b.timestamp);

			finalAlts.sort((a, b) => b.status - a.status);
		}

		finalAlts.push(...guildAlts);

		return finalAlts;
	}

	async handleRun({ interaction }: CommandHandleRunContext) {
		const client = this.client;

		const currentGuildId = interaction.guildId;

		const isGlobal =
			interaction.options.getBoolean('global', false) ?? true;

		const ephemeral =
			interaction.options.getBoolean('ephemeral', false) ?? false;

		let paginationManager: PaginationManager<Alt[]>;

		const chunkSize = 5;

		const registerPages = () => {
			const finalAlts = AltsCommand.getAlts(
				this.client,
				currentGuildId,
				isGlobal,
			);

			const chunkedAlts = client.util.chunkArray(
				finalAlts,
				chunkSize,
				true,
			);

			const pagesBuilder = new PaginationBuilder<Alt[]>()
				.addPages(chunkedAlts)
				.setOptions({ infinitePages: true });

			paginationManager = new PaginationManager(pagesBuilder);
		};

		registerPages();

		const getPageEmbed = () => {
			const currentPage = paginationManager.getCurrentPage();

			const fields = client.util.reverseMap(currentPage, (alt, i, ri) => {
				const gId = alt.guildId ?? currentGuildId;

				const lgId = currentPage.at(ri + 1)?.guildId ?? currentGuildId;

				const isKnownGid = i !== 0 && lgId === gId;

				const externalAuthString =
					client.managers.altManager.getExternalAuths(alt);

				return {
					name: `${
						isKnownGid || !isGlobal
							? ''
							: `${Emojis.Blank}\n${
									gId
										? client.guilds.cache.get(gId) ??
											'Unknown'
										: 'No guild'
								}\n\n`
					}${
						client.managers.altManager.getStatus(alt.status).emoji
					} ${alt.name} - ${AltStatus[alt.status]}${
						alt.private ? ` ${Emojis.Private}` : ''
					}`,
					value: `> ${client.util.toRelativeTimestamp(
						alt.timestamp,
					)} - by <@${alt.userId}>${externalAuthString ? `\n> ${externalAuthString}` : ''}${
						i === currentPage.length - 1 ? `\n${Emojis.Blank}` : ''
					}`,
				};
			});

			return new EmbedBuilder()
				.setColor(0x43b581)
				.setAuthor({
					iconURL: interaction.guild?.iconURL() ?? undefined,
					name: 'Human Alts for Bot Lobbies',
				})
				.setDescription(
					(!isGlobal &&
						`${Emojis.Private} _Showing only alts of this server._\n${Emojis.Blank}`) ||
						null,
				)
				.setFields(
					fields.length
						? fields
						: [
								{
									name: `${Emojis.User} No alts available right now`,
									value: `Sorry, there are no alts available at this moment.\nPress the ${Emojis.Reload} button to try again and refresh the message.\n\n${Emojis.Question} Add your own alt with </manage-alt add-alt:1206685461246910474>.`,
								},
							],
				)
				.setFooter(
					fields.length
						? {
								text: `Page ${
									paginationManager.pageIndicator
								} • ${
									paginationManager.pagesSize * chunkSize +
									paginationManager.getPage(
										paginationManager.pagesSize,
									)?.length
								} Alts registered`,
								iconURL: client.user?.avatarURL() ?? undefined,
							}
						: null,
				)
				.setTimestamp(fields.length ? Date.now() : null);
		};

		const getPageActionRow = (disableAll = false) => {
			const actionRow =
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId(CustomId.FirstPage)
						.setLabel('<<')
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(paginationManager.currentPageIndex === 0),
					new ButtonBuilder()
						.setCustomId(CustomId.PrevPage)
						.setLabel('<')
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(paginationManager.currentPageIndex === 0),
					new ButtonBuilder()
						.setCustomId(CustomId.Reload)
						.setEmoji(Emojis.Reload)
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId(CustomId.NextPage)
						.setLabel('>')
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(
							paginationManager.currentPageIndex ===
								paginationManager.pagesSize,
						),
					new ButtonBuilder()
						.setCustomId(CustomId.LastPage)
						.setLabel('>>')
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(
							paginationManager.currentPageIndex ===
								paginationManager.pagesSize,
						),
				);

			if (disableAll) {
				const newComponents = actionRow.components.map(
					(buttonBuilder) => buttonBuilder.setDisabled(true),
				);

				actionRow.setComponents(newComponents);
			}

			return actionRow;
		};

		const inRes = await interaction
			.reply({
				embeds: [getPageEmbed()],
				components: [getPageActionRow()],
				ephemeral,
			})
			.catch(() => null);

		const collector = inRes?.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 300000,
		});

		collector?.on('collect', async (i) => {
			await i.deferUpdate();

			switch (i.customId) {
				case CustomId.FirstPage:
					paginationManager.first();
					break;
				case CustomId.PrevPage:
					paginationManager.prev();
					break;
				case CustomId.Reload:
					registerPages();
					break;
				case CustomId.NextPage:
					paginationManager.next();
					break;
				case CustomId.LastPage:
					paginationManager.last();
					break;
			}

			await i
				.editReply({
					embeds: [getPageEmbed()],
					components: [getPageActionRow()],
				})
				.catch(() => null);
		});

		collector?.on('end', async () => {
			await interaction
				.editReply({
					components: [getPageActionRow(true)],
				})
				.catch(() => null);
		});
	}
}
