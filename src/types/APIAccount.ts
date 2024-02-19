export interface APIAccount {
	id: string;
	displayName?: string;
	displayNameType?: string;
	preferredLanguage?: string;
	accountStatus: 'ACTIVE' | 'DISABLED' | 'DELETED';
	externalAuths?: {
		github?: ExternalAuth;
		twitch?: ExternalAuth;
		steam?: ExternalAuth;
		psn?: ExternalAuth;
		xbl?: ExternalAuth;
		nintendo?: ExternalAuth;
	};
}

export interface ExternalAuth {
	accountId: string;
	type: string;
	externalAuthId?: string;
	externalAuthIdType: string;
	externalAuthSecondaryId?: string;
	externalDisplayName?: string;
	avatar?: string;
	authIds: {
		id: string;
		type: string;
	}[];
	regionInfo?: string;
}
