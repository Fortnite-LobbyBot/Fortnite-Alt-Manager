import { type BotClient } from '../classes/BotClient';
import { Emojis } from '../constants';
import { type Alt, AltStatus } from '../types/Alt';

export class AltManager {
	private client: BotClient;

	constructor(client: BotClient) {
		this.client = client;
	}

	addAlt(guildId: string | null, alt: Alt) {
		const guildAlts = this.client.alts.get(guildId) ?? [];

		guildAlts.push(alt);

		guildAlts.sort((a, b) => b.status - a.status);

		if (guildAlts.length === 1) this.client.alts.set(guildId, guildAlts);
	}

	getStatus(status: AltStatus) {
		let color = null;
		let emoji = null;

		switch (status) {
			case AltStatus.Online: {
				color = 0x43b581;
				emoji = Emojis.Online;
				break;
			}
			case AltStatus.Busy: {
				color = 0xf04747;
				emoji = Emojis.Busy;
				break;
			}
			case AltStatus.Idle: {
				color = 0xfaa61a;
				emoji = Emojis.Idle;
				break;
			}
			case AltStatus.Offline: {
				color = 0x747f8d;
				emoji = Emojis.Offline;
				break;
			}
		}
		return { color, emoji };
	}

	getExternalAuths(alt: Alt, bold?: boolean, separator = ' ') {
		return [
			alt.github &&
				`${Emojis.Github} ${this.client.util[bold ? 'toBold' : 'toCode'](alt.github)}`,
			alt.twitch &&
				`${Emojis.Twitch} ${this.client.util[bold ? 'toBold' : 'toCode'](alt.twitch)}`,
			alt.steam &&
				`${Emojis.Steam} ${this.client.util[bold ? 'toBold' : 'toCode'](alt.steam)}`,
			alt.psn &&
				`${Emojis.Psn} ${this.client.util[bold ? 'toBold' : 'toCode'](alt.psn)}`,
			alt.xbl &&
				`${Emojis.Xbl} ${this.client.util[bold ? 'toBold' : 'toCode'](alt.xbl)}`,
			alt.nintendo &&
				`${Emojis.Nintendo} ${this.client.util[bold ? 'toBold' : 'toCode'](alt.nintendo)}`,
		]
			.filter((e) => e)
			.join(separator);
	}

	setStatus(guildId: string | null, alt: Alt, status: AltStatus) {
		this.removeAlt(guildId, alt.userId);

		this.addAlt(guildId, { ...alt, status, timestamp: Date.now() });
	}

	removeAlt(guildId: string | null, userId: string) {
		const guildAlts = this.client.alts.get(guildId) ?? [];

		this.client.alts.set(
			guildId,
			guildAlts.filter((a) => a.userId !== userId),
		);
	}
}
