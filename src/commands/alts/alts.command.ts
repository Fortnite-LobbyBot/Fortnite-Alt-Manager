import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../../classes/Command';

export default new Command({
	id: 'alts',
	config: () => ({
		slash: new SlashCommandBuilder()
			.setName('alts')
			.setDescription('View the available alts.'),
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
