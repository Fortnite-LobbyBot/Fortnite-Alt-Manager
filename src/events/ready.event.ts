import { Events } from 'discord.js';
import { ClientEvent } from '../classes/ClientEvent';

export default new ClientEvent({
	name: Events.ClientReady,
	once: false,
	run: async ({ client }) => {
		console.log(
			'Client ready as',
			client.user?.tag,
			'in',
			client.guilds.cache.size,
			'guilds',
		);
	},
});
