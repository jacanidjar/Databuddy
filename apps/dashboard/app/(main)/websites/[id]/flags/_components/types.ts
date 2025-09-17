export interface Flag {
	id: string;
	key: string;
	name?: string | null;
	description?: string | null;
	type: string;
	status: string;
	defaultValue?: any;
	payload?: any;
	rolloutPercentage?: number | null;
	rules?: any;
	persistAcrossAuth?: boolean;
	websiteId?: string | null;
	organizationId?: string | null;
	userId?: string | null;
	createdBy: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date | null;
}

export interface UserRule {
	type: 'user_id' | 'email' | 'property';
	operator:
		| 'equals'
		| 'contains'
		| 'starts_with'
		| 'ends_with'
		| 'in'
		| 'not_in'
		| 'exists'
		| 'not_exists';
	field?: string;
	value?: any;
	values?: any[];
	enabled: boolean;
	batch: boolean;
	batchValues?: string[];
}
