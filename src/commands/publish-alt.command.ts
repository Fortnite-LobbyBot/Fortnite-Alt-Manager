import ky from 'ky';
import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../classes/Command';
import { CommandHandleRunContext } from '../classes/CommandHandleRunContext';
import ManageAltCommand from './manage-alt.command';
import type { APIAccount } from '../types/APIAccount';
import { AltStatus } from '../types/Alt';

export default class PublishAltCommand extends Command {
	id = 'publish-alt';

	getConfig() {
		return {
			slash: new SlashCommandBuilder()
				.setName('publish-alt')
				.setDescription('Publish your alt to the system')
				.addStringOption((o) =>
					o
						.setName('display-name')
						.setDescription(
							'The Epic Games display name of your alt',
						)
						.setRequired(true)
						.setMaxLength(64),
				)
				.addBooleanOption((o) =>
					o
						.setName('private')
						.setDescription(
							'Should the alt be displayed in other Discord servers?',
						)
						.setRequired(false),
				),
		};
	}

	async handleRun({ interaction }: CommandHandleRunContext) {
		const client = this.client;

		const currentGuildId = interaction.guildId;

		const userAlt = client.alts
			.get(currentGuildId)
			?.findLast((a) => a.userId === interaction.user.id);

		if (userAlt)
			return interaction.reply({
				content: 'You cannot have more than one alt.',
				ephemeral: true,
			});

		const displayName = interaction.options.getString('display-name', true);

		const bannedDisplayNames = [
			'tnfAngel',
			'BotMM',
			'.Gamebot',
			'Gamebot.',
			'bot-lobbies',
		];

		if (
			bannedDisplayNames.some((dp) =>
				dp.toLowerCase().includes(displayName.toLowerCase()),
			)
		)
			return interaction.reply({
				content: 'The provided display name is NOT an alt.',
				ephemeral: true,
			});

		const user = await ky
			.get(
				`https://egs.jaren.wtf/api/accounts/displayName/${displayName}`,
			)
			.json<APIAccount>()
			.catch(() => null);

		console.log(user);

		if (!user)
			return interaction.reply({
				content:
					'Invalid alt name provided. Please try again with the Epic Games name of your alt.',
				ephemeral: true,
			});

		if (user?.accountStatus !== 'ACTIVE')
			return interaction.reply({
				content: 'The account you provided is disabled or deleted.',
				ephemeral: true,
			});

		const userId = user.id;

		const alt = {
			guildId: currentGuildId,
			userId: interaction.user.id,
			name: displayName,
			status: AltStatus.Online,
			timestamp: Date.now(),
			private:
				interaction.options.getBoolean('private', false) ?? undefined,
		};

		client.managers.altManager.addAlt(currentGuildId, alt);

		await ManageAltCommand.postAltStatus(
			client,
			AltStatus.Online,
			alt,
			interaction,
		);
	}
}
