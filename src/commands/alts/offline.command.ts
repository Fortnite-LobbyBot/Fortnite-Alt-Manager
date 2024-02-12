import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../../classes/Command';

export default new Command({
	id: 'offline',
	config: () => ({
		slash: new SlashCommandBuilder()
			.setName('offline')
			.setDescription('Set the alt to offline.'),
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
