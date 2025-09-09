export interface Project {
	id: string;
	name: string;
	framework?: string | null;
	accountId: string;
	directoryListing: boolean;
	nodeVersion: string;
	live?: boolean;
	createdAt?: number;
	updatedAt?: number;
	primaryDomain?: string;
	productionUrl?: string;
	link?: {
		type: string;
		repo?: string;
		org?: string;
		productionBranch?: string;
	};
}

export interface Domain {
	name: string;
	apexName: string;
	projectId: string;
	redirect?: string | null;
	redirectStatusCode?: number | null;
	gitBranch?: string | null;
	customEnvironmentId?: string | null;
	updatedAt: number;
	createdAt: number;
	verified: boolean;
	verification?: Array<{
		type: string;
		domain: string;
		value: string;
		reason: string;
	}>;
}
