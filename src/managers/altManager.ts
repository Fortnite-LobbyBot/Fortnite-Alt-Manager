import { Alt, AltStatus, BotClient } from '../classes/BotClient';

export class AltManager {
	client: BotClient;
	constructor(client: BotClient) {
		this.client = client;
	}

	addAlt(guildId: string, alt: Alt) {
		const guildAlts = this.client.alts.get(guildId) ?? [];

		guildAlts.push(alt);

		this.client.alts.set(guildId, guildAlts);
	}

	getStatus(status: AltStatus) {
		let color = null;
		let emoji = null;

		switch (status) {
			case AltStatus.Online: {
				color = 0x43b581;
				emoji = '<:online:1206694802905763870>';
				break;
			}
			case AltStatus.Busy: {
				color = 0xf04747;
				emoji = '<:busy:1206694805975990294>';
				break;
			}
			case AltStatus.Idle: {
				color = 0xfaa61a;
				emoji = '<:idle:1206694804537479298>';
				break;
			}
			case AltStatus.Offline: {
				color = 0x747f8d;
				emoji = '<:offline:1206694807469301821>';
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
