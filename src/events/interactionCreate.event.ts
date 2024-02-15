import { Events } from 'discord.js';
import { ClientEvent } from '../classes/ClientEvent';

export default new ClientEvent({
	name: Events.InteractionCreate,
	once: false,
	run: async ({ client }, interaction) => {
		if (interaction.isChatInputCommand()) {
			const command = client.managers.commandManager.getCommand(
				(cmd) => cmd.id === interaction.commandName
			);

			if (command)
				await command
					.run({
						client,
						interaction,
					})
					.catch(async (error) => {
						console.error(error);

						await interaction.followUp({
							content: `An error ocurred while executing the commands:\n\n${client.util.toCodeBlock(
								'ts',
								error.toString()
							)}`,
							ephemeral: true
						});
					});
		}
	},
});
