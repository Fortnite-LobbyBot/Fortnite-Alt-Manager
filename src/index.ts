import { BotClient } from './classes/BotClient';
import { GatewayIntentBits, Partials } from 'discord.js';

const client = new BotClient({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
	partials: [Partials.Channel],
});

client.setup();
