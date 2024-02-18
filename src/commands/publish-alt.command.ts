import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../classes/Command';
import { CommandHandleRunContext } from '../classes/CommandHandleRunContext';
import { AltStatus } from '../classes/BotClient';
import ManageAltCommand from './manage-alt.command';

export default class PublishAltCommand extends Command {
	id = 'publish-alt';

	getConfig() {
		return {
			slash: new SlashCommandBuilder()
				.setName('publish-alt')
				.setDescription('Publish your alt to the system')
				.addStringOption((o) =>
					o
						.setName('name')
						.setDescription('The Fortnite display name of your alt')
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

		const alt = {
			guildId: currentGuildId,
			userId: interaction.user.id,
			name: interaction.options.getString('name', true),
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
