import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../classes/Command';
import { Alt, AltStatus } from '../../classes/BotClient';
import { Emojis } from '../../constants';

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

		const fields = client.util.reverseMap(finalAlts, (alt, i, ri) => {
			const gId = alt.guildId ?? currentGuildId;

			const lgId = finalAlts.at(ri + 1)?.guildId ?? currentGuildId;

			const isKnownGid = i !== 0 && lgId === gId;

			return {
				name: `${
					isKnownGid || !isGlobal
						? ''
						: `${client.guilds.cache.get(gId) ?? 'Unknown'}\n\n`
				}${client.managers.altManager.getStatus(alt.status).emoji} ${
					alt.name
				} - ${AltStatus[alt.status]}${
					alt.private ? ` ${Emojis.Private}` : ''
				}`,
				value: `${client.util.toRelativeTimestamp(
					alt.timestamp
				)} - by <@${alt.userId}>${
					i !== finalAlts.length - 1 ? `\n${Emojis.Blank}` : ''
				}`,
			};
		});

		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(0x43b581)
					.setAuthor({
						iconURL: interaction.guild?.iconURL() ?? undefined,
						name: 'Available alts for bot lobbies',
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
					),
			],
		});
	},
});
