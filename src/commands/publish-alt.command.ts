import ky from 'ky';
import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../classes/Command';
import { CommandHandleRunContext } from '../classes/CommandHandleRunContext';
import ManageAltCommand from './manage-alt.command';
import type { APIAccount } from '../types/APIAccount';
import { AltStatus } from '../types/Alt';
import type { HandleComponentInteractionContext } from '../classes/HandleInteractionContext';

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
						.setMaxLength(32),
				)
				.addBooleanOption((o) =>
					o
						.setName('private')
						.setDescription(
							'Should the alt be displayed in other Discord servers? (False by default)',
						)
						.setRequired(false),
				)
				.addBooleanOption((o) =>
					o
						.setName('hide-external')
						.setDescription(
							'Should the alt external account names be hidden? (False by default)',
						)
						.setRequired(false),
				),
		};
	}

	async handleRun({ interaction }: CommandHandleRunContext) {
		const client = this.client;

		const currentGuildId = interaction.guildId;

		const userDisplayName = interaction.options
			.getString('display-name', true)
			.trim();

		const privateUser =
			interaction.options.getBoolean('private', false) ?? false;

		const hideExternal =
			interaction.options.getBoolean('hide-external', false) ?? false;

		const userAlt = client.alts
			.get(currentGuildId)
			?.findLast((a) => a.userId === interaction.user.id);

		if (userAlt)
			return interaction.reply({
				content: 'You cannot have more than one alt.',
				ephemeral: true,
			});

		const bannedDisplayNames = [
			'tnfAngel',
			'BotMM',
			'.Gamebot',
			'Gamebot.',
			'bot-lobbies',
		];

		if (
			bannedDisplayNames.some((dp) =>
				dp.toLowerCase().includes(userDisplayName.toLowerCase()),
			)
		)
			return interaction.reply({
				content: 'The provided display name is NOT an alt.',
				ephemeral: true,
			});

		await interaction.deferReply({ ephemeral: true });

		const user = await ky
			.get(
				`https://egs.jaren.wtf/api/accounts/displayName/${encodeURIComponent(userDisplayName)}`,
			)
			.json<APIAccount>()
			.catch(() => null);

		if (!user)
			return interaction.editReply({
				content:
					'Invalid alt name provided. Please try again with the Epic Games name of your alt.',
			});

		if (user?.accountStatus !== 'ACTIVE')
			return interaction.editReply({
				content: 'The account you provided is disabled or deleted.',
			});

		const epicUserId = user.id;

		const displayName = user.displayName;

		const { github, twitch, steam, psn, xbl, nintendo } =
			(hideExternal ? undefined : user.externalAuths) ?? {};

		const alt = {
			guildId: currentGuildId,
			userId: interaction.user.id,
			epicUserId,
			name: displayName || userDisplayName,
			status: AltStatus.Online,
			timestamp: Date.now(),
			private: privateUser,
			github: github?.externalDisplayName,
			twitch: twitch?.externalDisplayName,
			steam: steam?.externalDisplayName,
			psn: psn?.externalDisplayName,
			xbl: xbl?.externalDisplayName,
			nintendo: hideExternal
				? undefined
				: nintendo
					? nintendo?.externalDisplayName
					: displayName,
		};

		client.managers.altManager.addAlt(currentGuildId, alt);

		await interaction.followUp({
			embeds: [
				ManageAltCommand.getAltStatusEmbed(
					client,
					AltStatus.Online,
					alt,
				),
			],
		});

		await interaction.editReply({
			embeds: [
				ManageAltCommand.getAltPanelEmbed(this.client, alt, alt.status),
			],
			components: [ManageAltCommand.getAltPanelComponents(alt.status)],
		});
	}

	public override async handleComponentInteraction({
		interaction,
	}: HandleComponentInteractionContext): Promise<any> {
		await ManageAltCommand.handlePanel(this.client, interaction);
	}
}
