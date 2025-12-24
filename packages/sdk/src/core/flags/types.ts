/** Flag evaluation result from API */
export interface FlagResult {
	enabled: boolean;
	value: boolean | string | number;
	payload: Record<string, unknown> | null;
	reason: string;
	variant?: string;
}

/** User context for flag evaluation */
export interface UserContext {
	userId?: string;
	email?: string;
	properties?: Record<string, unknown>;
}

/** SDK configuration */
export interface FlagsConfig {
	/** Client ID (website or organization ID) */
	clientId: string;
	/** API URL (default: https://api.databuddy.cc) */
	apiUrl?: string;
	/** User context for evaluation */
	user?: UserContext;
	/** Disable flag evaluation entirely */
	disabled?: boolean;
	/** Enable debug logging */
	debug?: boolean;
	/** Skip persistent storage (browser only) */
	skipStorage?: boolean;
	/** Session is loading - defer evaluation */
	isPending?: boolean;
	/** Auto-fetch all flags on init (default: true) */
	autoFetch?: boolean;
	/** Environment name */
	environment?: string;
	/** Cache TTL in ms - after this, cache is invalid (default: 60000) */
	cacheTtl?: number;
	/** Stale time in ms - after this, revalidate in background (default: cacheTtl/2) */
	staleTime?: number;
}

/** Synchronous flag state for React hooks */
export interface FlagState {
	enabled: boolean;
	isLoading: boolean;
	isReady: boolean;
	value?: boolean | string | number;
	variant?: string;
}

/** Context returned by useFlags hook */
export interface FlagsContext {
	isEnabled: (key: string) => FlagState;
	getValue: <T extends boolean | string | number = boolean>(key: string, defaultValue?: T) => T;
	getFlag: (key: string) => Promise<FlagResult>;
	fetchAllFlags: () => Promise<void>;
	updateUser: (user: UserContext) => void;
	refresh: (forceClear?: boolean) => Promise<void>;
	isReady: boolean;
}

/** Storage interface for persistence */
export interface StorageInterface {
	get(key: string): FlagResult | null;
	set(key: string, value: FlagResult): void;
	getAll(): Record<string, FlagResult>;
	setAll(flags: Record<string, FlagResult>): void;
	delete?(key: string): void;
	deleteMultiple?(keys: string[]): void;
	clear(): void;
	cleanupExpired(): void;
}

/** Manager constructor options */
export interface FlagsManagerOptions {
	config: FlagsConfig;
	storage?: StorageInterface;
	onFlagsUpdate?: (flags: Record<string, FlagResult>) => void;
	onConfigUpdate?: (config: FlagsConfig) => void;
	onReady?: () => void;
}

/** Flags manager interface */
export interface FlagsManager {
	getFlag: (key: string, user?: UserContext) => Promise<FlagResult>;
	isEnabled: (key: string) => FlagState;
	getValue: <T = boolean | string | number>(key: string, defaultValue?: T) => T;
	fetchAllFlags: (user?: UserContext) => Promise<void>;
	updateUser: (user: UserContext) => void;
	refresh: (forceClear?: boolean) => Promise<void>;
	updateConfig: (config: FlagsConfig) => void;
	getMemoryFlags: () => Record<string, FlagResult>;
	isReady: () => boolean;
	destroy?: () => void;
}
