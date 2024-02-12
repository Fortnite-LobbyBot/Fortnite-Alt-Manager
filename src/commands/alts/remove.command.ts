import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../../classes/Command';

export default new Command({
	id: 'remove',
	config: () => ({
		slash: new SlashCommandBuilder()
			.setName('remove')
			.setDescription('Removes the alt.'),
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
