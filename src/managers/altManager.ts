import { type Alt, AltStatus, BotClient } from '../classes/BotClient';
import { Emojis } from '../constants';

export class AltManager {
	client: BotClient;

	constructor(client: BotClient) {
		this.client = client;
	}

	addAlt(guildId: string, alt: Alt) {
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

	setStatus(guildId: string, alt: Alt, status: AltStatus) {
		this.removeAlt(guildId, alt.userId);

		this.addAlt(guildId, { ...alt, status, timestamp: Date.now() });
	}

	removeAlt(guildId: string, userId: string) {
		const guildAlts = this.client.alts.get(guildId) ?? [];

		this.client.alts.set(
			guildId,
			guildAlts.filter((a) => a.userId !== userId)
		);
	}
}
