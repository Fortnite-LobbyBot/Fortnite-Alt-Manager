import { Events, InteractionType } from 'discord.js';
import { ClientEvent } from '../classes/ClientEvent';

export default new ClientEvent({
	name: Events.InteractionCreate,
	once: false,
	run: async ({ client }, interaction) => {
		if (interaction.isChatInputCommand()) {
			const command = client.commands.get(interaction.commandName);

			if (command)
				await command
					.handleRun({
						interaction,
					})
					.catch(async (error) => {
						console.error(error);

						await interaction.followUp({
							content: `An error ocurred while executing the command:\n\n${client.util.toCodeBlock(
								'ts',
								error.toString(),
							)}`,
							ephemeral: true,
						});
					});
		} else {
			let commandName: string | undefined;

			switch (interaction.type) {
				case InteractionType.ApplicationCommand:
				case InteractionType.ApplicationCommandAutocomplete:
					commandName = interaction.commandName;
					break;
				case InteractionType.ModalSubmit:
				case InteractionType.MessageComponent:
					commandName = interaction.message?.interaction?.commandName;

					if (!commandName)
						await interaction.message
							?.fetch()
							.catch(() => null)
							.then(
								(msg) =>
									(commandName =
										msg?.interaction?.commandName),
							);

					break;
			}

			commandName = commandName?.split(' ').at(0)?.trim();

			if (!commandName)
				return console.error(
					'[Interaction Handler] Unknown interaction type or no command name:',
					InteractionType[interaction.type],
				);

			const command = client.commands.get(commandName);

			if (!command)
				return console.error(
					'[Interaction Handler] Unknown command:',
					commandName,
					'Interaction type:',
					InteractionType[interaction.type],
				);

			let handler;

			switch (interaction.type) {
				case InteractionType.ApplicationCommand:
					handler = command.handleContextMenuInteraction?.({
						interaction,
					});
					break;
				case InteractionType.ApplicationCommandAutocomplete:
					handler = command.handleAutocompleteInteraction?.({
						interaction,
					});
					break;
				case InteractionType.ModalSubmit:
					handler = command.handleModalSubmitInteraction?.({
						interaction,
					});
					break;
				case InteractionType.MessageComponent:
					handler = command.handleComponentInteraction?.({
						interaction,
					});
					break;
			}

			const interactionErrorHandler = (err: any) =>
				console.error(
					'⚠️  - Interaction handling failed!',
					'\nInteraction Command:',
					commandName ? `/${commandName}` : 'Unknown',
					'\nInteraction Type:',
					InteractionType[interaction.type],
					'\nError:\n',
					err,
				);

			await handler?.catch(interactionErrorHandler);

			await command
				.handleInteraction?.({
					interaction,
				})
				.catch(interactionErrorHandler);
		}
	},
});
