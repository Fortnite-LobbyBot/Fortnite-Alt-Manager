import { GatewayIntentBits, Options } from 'discord.js';
import { BotClient } from './classes/BotClient';

const client = new BotClient({
	intents: [GatewayIntentBits.Guilds],
	makeCache: Options.cacheWithLimits({
		...Options.DefaultMakeCacheSettings,
		ReactionManager: 0,
		GuildMemberManager: 0,
		GuildMessageManager: 0,
		DMMessageManager: 0,
		MessageManager: 0,
		ReactionUserManager: 0,
		ApplicationCommandManager: 0,
		AutoModerationRuleManager: 0,
		BaseGuildEmojiManager: 0,
		GuildBanManager: 0,
		GuildEmojiManager: 0,
		GuildForumThreadManager: 0,
		GuildInviteManager: 0,
		GuildScheduledEventManager: 0,
		GuildStickerManager: 0,
		GuildTextThreadManager: 0,
		PresenceManager: 0,
		StageInstanceManager: 0,
		ThreadManager: 0,
		ThreadMemberManager: 0,
		UserManager: 0,
		VoiceStateManager: 0
	})
});

client.setup();
