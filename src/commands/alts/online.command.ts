import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../../classes/Command';

export default new Command({
	id: 'online',
	config: () => ({
		slash: new SlashCommandBuilder()
			.setName('online')
			.setDescription('Set the alt to online.'),
	}),
	run: async ({ interaction }) => {
		if (!interaction.inCachedGuild())
			return interaction.reply({
				content: 'Invalid guild.',
				ephemeral: true,
			});

		return interaction.reply('Work in progress');
	},
});
