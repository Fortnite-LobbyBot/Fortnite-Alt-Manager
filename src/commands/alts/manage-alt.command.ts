import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../classes/Command';
import { AltStatus } from '../../classes/BotClient';

export default new Command({
	id: 'manage-alt',
	config: () => ({
		slash: new SlashCommandBuilder()
			.setName('manage-alt')
			.setDescription('Manage your alts.')
			.addSubcommand((c) =>
				c
					.setName('add-alt')
					.setDescription('Set your alt as online')
					.addStringOption((o) =>
						o
							.setName('name')
							.setDescription(
								'The Fortnite display name of your alt'
							)
							.setRequired(true)
							.setMaxLength(64)
					)
					.addBooleanOption((o) =>
						o
							.setName('private')
							.setDescription(
								'Should the alt be displayed in other Discord servers?'
							)
							.setRequired(false)
					)
			)
			.addSubcommand((c) =>
				c.setName('set-online').setDescription('Set your alt as online')
			)
			.addSubcommand((c) =>
				c.setName('set-busy').setDescription('Set your alt as busy')
			)
			.addSubcommand((c) =>
				c.setName('set-idle').setDescription('Set your alt as idle')
			)
			.addSubcommand((c) =>
				c
					.setName('set-offline')
					.setDescription('Set your alt as offline')
			)
			.addSubcommand((c) =>
				c.setName('remove-alt').setDescription('Removes your alt')
			),
	}),
	run: async ({ client, interaction }) => {
		if (!interaction.inCachedGuild())
			return interaction.reply({
				content: 'Invalid guild.',
				ephemeral: true,
			});

		const subcommand = interaction.options.getSubcommand(true);

		const userAlt = client.alts.findLast(
			(a) => a.userId === interaction.user.id
		);

		if (subcommand !== 'add-alt' && !userAlt)
			return interaction.reply({
				content:
					'You need to add an alt first. Add it with /manage-alt add-alt.',
				ephemeral: true,
			});

		async function updateAltStatus(status: AltStatus, alt = userAlt) {
			if (!alt) return;

			client.managers.altManager.setStatus(alt, status);

			return postAltStatus(status, alt);
		}

		async function postAltStatus(status: AltStatus, alt = userAlt) {
			if (!alt) return;

			const { color: embedColor, emoji: embedEmoji } =
				client.managers.altManager.getStatus(status);

			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor(embedColor)
						.setDescription(
							`${embedEmoji} The alt ${client.util.toCode(
								alt.name
							)} is now: **${AltStatus[status]}**`
						),
				],
			});
		}
		switch (subcommand) {
			case 'add-alt': {
				if (userAlt)
					return interaction.reply({
						content: 'You cannot have more than one alt.',
						ephemeral: true,
					});

				const alt = {
					guildId: interaction.guildId ?? undefined,
					userId: interaction.user.id,
					name: interaction.options.getString('name', true),
					status: AltStatus.Online,
					timestamp: Date.now(),
					private:
						interaction.options.getBoolean('private', false) ??
						undefined,
				};

				client.managers.altManager.addAlt(alt);

				await postAltStatus(AltStatus.Online, alt);

				break;
			}
			case 'set-online': {
				await updateAltStatus(AltStatus.Online);

				break;
			}
			case 'set-busy': {
				await updateAltStatus(AltStatus.Busy);

				break;
			}
			case 'set-idle': {
				await updateAltStatus(AltStatus.Idle);

				break;
			}
			case 'set-offline': {
				await updateAltStatus(AltStatus.Offline);

				break;
			}
			case 'remove-alt': {
				client.managers.altManager.removeAlt(interaction.user.id);

				return interaction.reply({
					content: 'Alt removed successfully.',
					ephemeral: true,
				});
			}
		}
	},
});
