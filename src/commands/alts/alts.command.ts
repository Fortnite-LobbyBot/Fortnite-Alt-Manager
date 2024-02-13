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

		const currentGuildId = interaction.guildId;

		const isGlobal =
			interaction.options.getBoolean('global', false) ?? true;

		const currentGuildAlts = client.alts.get(currentGuildId) ?? [];

		console.log([...client.alts.entries()]);

		const fields = (
			isGlobal
				? [
						...[...client.alts.entries()].filter(
							([gId]) => gId !== currentGuildId
						),
						[currentGuildId, currentGuildAlts] as const,
				  ]
				: [[currentGuildId, currentGuildAlts] as const]
		)
			.slice(-25)
			.map(
				([guildId, alts]) =>
					alts
						.filter((a) => !a.private || guildId === currentGuildId)
						.map((alt, i) => ({
							name:
								(i === 0
									? `${
											client.guilds.cache.get(guildId) ??
											'Unknown'
									  }\n\n`
									: '') +
								`${
									client.managers.altManager.getStatus(
										alt.status
									).emoji
								} ${alt.name} - ${AltStatus[alt.status]}${
									alt.private
										? ' <:P:1206756287648497714>'
										: ''
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
