export interface Alt {
	guildId?: string | null;
	userId: string;
	epicUserId?: string;
	name: string;
	discordUsername: string;
	status: AltStatus;
	timestamp: number;
	private?: boolean;

	github?: string;
	twitch?: string;
	steam?: string;
	psn?: string;
	xbl?: string;
	nintendo?: string;
}

export enum AltStatus {
	Online = 0,
	Busy = 1,
	Idle = 2,
	Offline = 3,
}
