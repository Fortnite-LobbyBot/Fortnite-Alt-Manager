import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../classes/Command';
import { AltStatus } from '../../classes/BotClient';

export default new Command({
	id: 'alts',
	config: () => ({
		slash: new SlashCommandBuilder()
			.setName('alts')
			.setDescription('View the available alts.')
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

		const isGlobal =
			interaction.options.getBoolean('global', false) ?? true;

		const alts = client.alts
			.slice(-25)
			.filter(
				(a) =>
					(!isGlobal ? a.guildId === interaction.guildId : true) &&
					(!a.private || a.guildId === interaction.guildId)
			)
			.toSorted((a, b) => b.timestamp - a.timestamp)
			.toSorted((a, b) => a.status - b.status);

		const fields = Object.entries(
			Object.groupBy(
				alts,
				({ guildId }) =>
					client.guilds.cache.get(guildId ?? '0')?.name ?? 'Unknown'
			)
		)
			.map(
				([serverName, alts]) =>
					alts?.map((alt, i) => ({
						name:
							(i === 0 ? `${serverName}\n\n` : '') +
							`${
								client.managers.altManager.getStatus(alt.status)
									.emoji
							} ${alt.name} - ${AltStatus[alt.status]}${
								alt.private ? ' <:P:1206756287648497714>' : ''
							}`,
						value: `${client.util.toRelativeTimestamp(
							alt.timestamp
						)} - by <@${alt.userId}>`,
					})) ?? []
			)
			.flat();

		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(0x43b581)
					.setAuthor({
						iconURL: interaction.guild?.iconURL() ?? undefined,
						name: 'Available alts for bot lobbies',
					})
					.setFields(
						fields.length
							? fields
							: [
									{
										name: 'No alts available',
										value: 'Sorry, there are no alts available at this moment, try again later.',
									},
							  ]
					),
			],
		});
	},
});
