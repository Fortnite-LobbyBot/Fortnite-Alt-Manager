import { GatewayIntentBits } from 'discord.js';
import { BotClient } from './classes/BotClient';

const client = new BotClient({
	intents: [GatewayIntentBits.Guilds],
});

client.setup();
