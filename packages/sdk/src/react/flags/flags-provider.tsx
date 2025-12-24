/** biome-ignore-all lint/correctness/noUnusedImports: we need to import React to use the createContext function */
import React, {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useSyncExternalStore,
} from "react";
import { BrowserFlagStorage } from "@/core/flags/browser-storage";
import { CoreFlagsManager } from "@/core/flags/flags-manager";
import type {
	FlagResult,
	FlagState,
	FlagsConfig,
	FlagsContext,
	UserContext,
} from "@/core/flags/types";
import { logger } from "@/logger";

/** Internal store for flags state */
interface FlagsStore {
	flags: Record<string, FlagResult>;
	isReady: boolean;
}

const FlagsReactContext = createContext<FlagsContext | null>(null);

export interface FlagsProviderProps extends FlagsConfig {
	children: ReactNode;
}

/**
 * Flags provider component
 * Creates a manager instance and provides flag methods to children
 */
export function FlagsProvider({ children, ...config }: FlagsProviderProps) {
	// Use ref to hold mutable state that doesn't trigger re-renders
	const storeRef = useRef<FlagsStore>({ flags: {}, isReady: false });
	const listenersRef = useRef<Set<() => void>>(new Set());

	// Create manager once (stable reference)
	const manager = useMemo(() => {
		const storage = config.skipStorage ? undefined : new BrowserFlagStorage();

		return new CoreFlagsManager({
			config,
			storage,
			onFlagsUpdate: (flags) => {
				storeRef.current = { ...storeRef.current, flags };
				// Notify all subscribers
				for (const listener of listenersRef.current) {
					listener();
				}
			},
			onReady: () => {
				storeRef.current = { ...storeRef.current, isReady: true };
				for (const listener of listenersRef.current) {
					listener();
				}
			},
		});
	}, [config.clientId]); // Only recreate if clientId changes

	// Update config when props change (isPending, user, etc.)
	// Use a ref to track previous config and avoid unnecessary updates
	const prevConfigRef = useRef(config);
	useEffect(() => {
		const prevConfig = prevConfigRef.current;
		// Check if config actually changed
		const configChanged =
			prevConfig.apiUrl !== config.apiUrl ||
			prevConfig.isPending !== config.isPending ||
			prevConfig.user?.userId !== config.user?.userId ||
			prevConfig.user?.email !== config.user?.email ||
			prevConfig.environment !== config.environment ||
			prevConfig.disabled !== config.disabled ||
			prevConfig.autoFetch !== config.autoFetch ||
			prevConfig.cacheTtl !== config.cacheTtl ||
			prevConfig.staleTime !== config.staleTime;

		if (configChanged) {
			prevConfigRef.current = config;
			manager.updateConfig(config);
		}
	}, [manager, config]);

	useEffect(() => {
		return () => {
			manager.destroy();
		};
	}, [manager]);

	// Subscribe function for useSyncExternalStore
	const subscribe = useMemo(
		() => (callback: () => void) => {
			listenersRef.current.add(callback);
			return () => {
				listenersRef.current.delete(callback);
			};
		},
		[]
	);

	// Get current snapshot
	const getSnapshot = useMemo(() => () => storeRef.current, []);

	// Subscribe to store updates
	const store = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

	// Build context value
	const contextValue = useMemo<FlagsContext>(
		() => ({
			isEnabled: (key: string): FlagState => {
				const result = store.flags[key];
				if (result) {
					return {
						enabled: result.enabled,
						value: result.value,
						variant: result.variant,
						isLoading: false,
						isReady: true,
					};
				}
				return manager.isEnabled(key);
			},

			getValue: <T extends boolean | string | number>(
				key: string,
				defaultValue?: T
			): T => {
				const result = store.flags[key];
				if (result) {
					return result.value as T;
				}
				return manager.getValue(key, defaultValue);
			},

			getFlag: (key: string) => manager.getFlag(key),

			fetchAllFlags: () => manager.fetchAllFlags(),

			updateUser: (user: UserContext) => manager.updateUser(user),

			refresh: (forceClear = false) => manager.refresh(forceClear),

			isReady: store.isReady,
		}),
		[manager, store]
	);

	return (
		<FlagsReactContext.Provider value={contextValue}>
			{children}
		</FlagsReactContext.Provider>
	);
}

/**
 * Hook to access flags context
 */
export function useFlags(): FlagsContext {
	const context = useContext(FlagsReactContext);

	if (!context) {
		logger.warn("useFlags called outside FlagsProvider");
		// Return a no-op context for safety
		return {
			isEnabled: () => ({ enabled: false, isLoading: false, isReady: false }),
			getValue: <T extends boolean | string | number = boolean>(
				_key: string,
				defaultValue?: T
			) => (defaultValue ?? false) as T,
			getFlag: async () => ({
				enabled: false,
				value: false,
				payload: null,
				reason: "NO_PROVIDER",
			}),
			fetchAllFlags: async () => {},
			updateUser: () => {},
			refresh: async () => {},
			isReady: false,
		};
	}

	return context;
}

/**
 * Hook to get a specific flag's state
 */
export function useFlag(key: string): FlagState {
	const { isEnabled } = useFlags();
	return isEnabled(key);
}

/**
 * Hook to get a flag's value with type safety
 */
export function useFlagValue<T extends boolean | string | number = boolean>(
	key: string,
	defaultValue?: T
): T {
	const { getValue } = useFlags();
	return getValue(key, defaultValue);
}
