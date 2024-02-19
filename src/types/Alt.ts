export interface Alt {
	guildId?: string | null;
	userId: string;
	name: string;
	status: AltStatus;
	timestamp: number;
	private?: boolean;
}

export enum AltStatus {
	Online = 0,
	Busy = 1,
	Idle = 2,
	Offline = 3,
}
