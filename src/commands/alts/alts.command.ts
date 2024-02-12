import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../classes/Command';
import { AltStatus } from '../../classes/BotClient';

export default new Command({
	id: 'alts',
	config: () => ({
		slash: new SlashCommandBuilder()
			.setName('alts')
			.setDescription('View the available alts.'),
	}),
	run: async ({ client, interaction }) => {
		if (!interaction.inCachedGuild())
			return interaction.reply({
				content: 'Invalid guild.',
				ephemeral: true,
			});

		const alts = client.alts
			.slice(-25)
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
							} ${alt.name}`,
						value: `${
							AltStatus[alt.status]
						} - ${client.util.toRelativeTimestamp(alt.timestamp)}`,
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
