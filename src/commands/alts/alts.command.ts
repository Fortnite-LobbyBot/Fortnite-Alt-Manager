import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import { Command } from '../../classes/Command';
import { type Alt, AltStatus } from '../../classes/BotClient';
import { Emojis } from '../../constants';
import { PaginationBuilder, PaginationManager } from 'pagination-manager';

export default new Command({
	id: 'alts',
	config: () => ({
		slash: new SlashCommandBuilder()
			.setName('alts')
			.setDescription('View the available alts for bot lobbies.')
			.addBooleanOption((o) =>
				o
					.setName('global')
					.setDescription(
						'Display global alts, not only the ones on this server'
					)
					.setRequired(false)
			),
	}),
	run: async ({ client, interaction }) => {
		if (!interaction.inCachedGuild())
			return interaction.reply({
				content: 'Invalid guild.',
				ephemeral: true,
			});

		const currentGuildId = interaction.guildId;

		const isGlobal =
			interaction.options.getBoolean('global', false) ?? true;

		let paginationManager: PaginationManager<Alt[]>;

		const chunkSize = 4;

		function getAlts() {
			const finalAlts: Alt[] = [];

			const guildAlts: Alt[] = client.alts.get(currentGuildId) ?? [];

			if (isGlobal) {
				for (const [guildId, alts] of client.alts)
					if (guildId !== currentGuildId)
						for (const alt of alts)
							if (!alt.private)
								finalAlts.push({ ...alt, guildId });

				finalAlts.sort((a, b) => a.timestamp - b.timestamp);

				finalAlts.sort((a, b) => b.status - a.status);
			}

			finalAlts.push(...guildAlts);

			return finalAlts;
		}

		function registerPages() {
			const finalAlts = getAlts();
			const chunkedAlts = client.util.chunkArray(
				finalAlts,
				chunkSize,
				true
			);

			const pagesBuilder = new PaginationBuilder<Alt[]>()
				.addPages(chunkedAlts)
				.setOptions({ infinitePages: true });

			paginationManager = new PaginationManager(pagesBuilder);
		}

		registerPages();

		const getPageEmbed = () => {
			const currentPage = paginationManager.getCurrentPage();

			const fields = client.util.reverseMap(currentPage, (alt, i, ri) => {
				const gId = alt.guildId ?? currentGuildId;

				const lgId = currentPage.at(ri + 1)?.guildId ?? currentGuildId;

				const isKnownGid = i !== 0 && lgId === gId;

				return {
					name: `${
						isKnownGid || !isGlobal
							? ''
							: `${client.guilds.cache.get(gId) ?? 'Unknown'}\n\n`
					}${
						client.managers.altManager.getStatus(alt.status).emoji
					} ${alt.name} - ${AltStatus[alt.status]}${
						alt.private ? ` ${Emojis.Private}` : ''
					}`,
					value: `${client.util.toRelativeTimestamp(
						alt.timestamp
					)} - by <@${alt.userId}>${
						i !== currentPage.length - 1 ? `\n${Emojis.Blank}` : ''
					}`,
				};
			});

			return new EmbedBuilder()
				.setColor(0x43b581)
				.setAuthor({
					iconURL: interaction.guild?.iconURL() ?? undefined,
					name: 'Available Alts for Bot Lobbies',
				})
				.setDescription(
					(!isGlobal &&
						`${Emojis.Private} _Showing only alts of this server_\n${Emojis.Blank}`) ||
						null
				)
				.setFields(
					fields.length
						? fields
						: [
								{
									name: 'No alts available',
									value: 'Sorry, there are no alts available at this moment, try again later.',
								},
						  ]
				)
				.setFooter(
					fields.length
						? {
								text: `Page ${
									paginationManager.pageIndicator
								} • ${
									paginationManager.pagesSize * chunkSize +
									paginationManager.getPage(
										paginationManager.pagesSize
									)?.length
								} Alts registered`,
						  }
						: null
				)
				.setTimestamp();
		};

		const getPageActionRow = (disableAll = false) => {
			const actionRow =
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId('first')
						.setLabel('<<')
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(paginationManager.currentPageIndex === 0),
					new ButtonBuilder()
						.setCustomId('prev')
						.setLabel('<')
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(paginationManager.currentPageIndex === 0),
					new ButtonBuilder()
						.setCustomId('reload')
						.setEmoji(Emojis.Reload)
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('next')
						.setLabel('>')
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(
							paginationManager.currentPageIndex ===
								paginationManager.pagesSize
						),
					new ButtonBuilder()
						.setCustomId('last')
						.setLabel('>>')
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(
							paginationManager.currentPageIndex ===
								paginationManager.pagesSize
						)
				);

			if (disableAll) {
				const newComponents = actionRow.components.map(
					(buttonBuilder) => buttonBuilder.setDisabled(true)
				);

				actionRow.setComponents(newComponents);
			}

			return actionRow;
		};

		const message = await interaction.reply({
			embeds: [getPageEmbed()],
			components: [getPageActionRow()],
		});

		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 300000,
		});

		collector.on('collect', async (i) => {
			if (i.user.id === interaction.user.id) {
				await i.deferUpdate();
				switch (i.customId) {
					case 'first':
						paginationManager.first();
						await interaction.editReply({
							embeds: [getPageEmbed()],
							components: [getPageActionRow()],
						});
						break;
					case 'prev': {
						paginationManager.prev();
						await interaction.editReply({
							embeds: [getPageEmbed()],
							components: [getPageActionRow()],
						});
						break;
					}
					case 'reload': {
						registerPages();
						await interaction.editReply({
							embeds: [getPageEmbed()],
							components: [getPageActionRow()],
						});
						break;
					}
					case 'next': {
						paginationManager.next();
						await interaction.editReply({
							embeds: [getPageEmbed()],
							components: [getPageActionRow()],
						});
						break;
					}
					case 'last': {
						paginationManager.last();
						await interaction.editReply({
							embeds: [getPageEmbed()],
							components: [getPageActionRow()],
						});
						break;
					}
				}
			} else {
				await i.reply({
					content: 'Not your buttons.',
					ephemeral: true,
				});
			}
		});

		collector.on('end', async () => {
			await interaction.editReply({
				components: [getPageActionRow(true)],
			});
		});
	},
});
