import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	EmbedBuilder,
	SlashCommandBuilder
} from 'discord.js';
import ky from 'ky';
import { Command } from '../classes/Command';
import { CommandHandleRunContext } from '../classes/CommandHandleRunContext';
import type { HandleComponentInteractionContext } from '../classes/HandleInteractionContext';
import { Emojis } from '../constants';
import type { APIAccount } from '../types/APIAccount';
import { type Alt, AltStatus } from '../types/Alt';
import ManageAltCommand from './manage-alt.command';

enum CustomId {
	Accept = 'accept',
	Decline = 'decline'
}

export default class PublishAltCommand extends Command {
	id = 'publish-alt-volunteer';

	getConfig() {
		return {
			slash: new SlashCommandBuilder()
				.setName(this.id)
				.setDescription('Help others by publishing the name of your alt')
				.addStringOption((o) =>
					o
						.setName('display-name')
						.setDescription('The Epic Games display name of your alt')
						.setRequired(true)
						.setMaxLength(32)
				)
				.addBooleanOption((o) =>
					o
						.setName('private')
						.setDescription('Should the alt be hidden in other Discord servers? (False by default)')
						.setRequired(false)
				)
				.addBooleanOption((o) =>
					o
						.setName('hide-external')
						.setDescription('Should the alt external account names be hidden? (False by default)')
						.setRequired(false)
				)
		};
	}

	async handleRun({ interaction }: CommandHandleRunContext) {
		const client = this.client;

		const currentGuildId = interaction.guildId;

		const userDisplayName = interaction.options.getString('display-name', true).trim();

		const privateUser = interaction.options.getBoolean('private', false) ?? false;

		const hideExternal = interaction.options.getBoolean('hide-external', false) ?? false;

		const userAlt = client.alts.get(currentGuildId)?.findLast((a) => a.userId === interaction.user.id);

		if (userAlt)
			return interaction.reply({
				content: 'You cannot have more than one alt.',
				ephemeral: true
			});

		const bannedDisplayNames = [
			'tnfAngel',
			'BotMM',
			'.Gamebot',
			'Gamebot.',
			'bot-lobbies',
			'.bot lobbies',
			'Lobby Bots '
		];

		if (bannedDisplayNames.some((dp) => dp.toLowerCase().includes(userDisplayName.toLowerCase())))
			return interaction.reply({
				content: 'The provided display name is NOT an alt.',
				ephemeral: true
			});

		await interaction.deferReply({ ephemeral: true });

		const user = await ky
			.get(`https://egs.jaren.wtf/api/accounts/displayName/${encodeURIComponent(userDisplayName)}`)
			.json<APIAccount>()
			.catch(() => null);

		if (!user)
			return interaction.editReply({
				content: 'Invalid alt name provided. Please try again with the Epic Games name of your alt.'
			});

		if (user?.accountStatus !== 'ACTIVE')
			return interaction.editReply({
				content: 'The account you provided is disabled or deleted.'
			});

		const epicUserId = user.id;

		const displayName = user.displayName;

		const { github, twitch, steam, psn, xbl, nintendo } = (hideExternal ? undefined : user.externalAuths) ?? {};

		const alt: Alt = {
			guildId: currentGuildId,
			userId: interaction.user.id,
			epicUserId,
			name: displayName || userDisplayName,
			discordUsername: interaction.user.username,
			status: AltStatus.Online,
			timestamp: Date.now(),
			private: privateUser,
			github: github?.externalDisplayName,
			twitch: twitch?.externalDisplayName,
			steam: steam?.externalDisplayName,
			psn: psn?.externalDisplayName,
			xbl: xbl?.externalDisplayName,
			nintendo: hideExternal ? undefined : nintendo ? nintendo.externalDisplayName ?? displayName : undefined
		};

		const ea = client.managers.altManager.getExternalAuths(alt, true);

		const fwUp = await interaction.followUp({
			ephemeral: true,
			embeds: [
				new EmbedBuilder()
					.setColor(0x248046)
					.setAuthor({
						iconURL: interaction.user.avatarURL() ?? undefined,
						name: 'Serve alt account as a volunteer'
					})
					.setDescription(
						`${Emojis.Question} **Are you sure you want to help others with bot lobbies using this account?**\n\n${Emojis.User} Display names: ${privateUser ? ` ${Emojis.Private}` : ''}${Emojis.Epic} ${client.util.toBold(alt.name)} ${hideExternal ? `| ${Emojis.Warning} External accounts hidden` : ea ? `| ${ea}` : ''}\n\n> ${Emojis.Warning} Please **MAKE SURE** that you are adding only **YOUR** account.`
					)
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId(CustomId.Accept)
						.setStyle(ButtonStyle.Success)
						.setLabel('Yes, I want to help others!')
						.setEmoji(client.util.getEmojiId(Emojis.Like)),
					new ButtonBuilder()
						.setCustomId(CustomId.Decline)
						.setStyle(ButtonStyle.Secondary)
						.setLabel('Never mind')
						.setEmoji(client.util.getEmojiId(Emojis.Cancel))
				)
			]
		});

		const rsp = await fwUp
			?.awaitMessageComponent({
				componentType: ComponentType.Button,
				time: 30_000
			})
			.catch(() => null);

		if (!rsp) return interaction.editReply({ components: [] });

		if (rsp.customId === CustomId.Decline)
			return rsp.update({
				content: 'Thanks for your answer.',
				components: [],
				embeds: []
			});

		client.managers.altManager.addAlt(currentGuildId, alt);

		await interaction.followUp({
			ephemeral: false,
			embeds: [ManageAltCommand.getAltStatusEmbed(client, AltStatus.Online, alt)]
		});

		await rsp.update({
			embeds: [ManageAltCommand.getAltPanelEmbed(client, alt, alt.status)],
			components: [ManageAltCommand.getAltPanelComponents(client, alt.status)]
		});
	}

	public override async handleComponentInteraction({ interaction }: HandleComponentInteractionContext): Promise<any> {
		if (interaction.customId !== CustomId.Accept && interaction.customId !== CustomId.Decline)
			await ManageAltCommand.handlePanel(this.client, interaction);
	}
}
