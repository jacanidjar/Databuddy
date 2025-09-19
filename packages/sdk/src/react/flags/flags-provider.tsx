import { atom, createStore, Provider, useAtom } from 'jotai';
import type { ReactNode } from 'react';
import { createElement, useEffect } from 'react';
import { flagStorage } from './flag-storage';
import type { FlagResult, FlagState, FlagsConfig } from './types';

const flagsStore = createStore();

const configAtom = atom<FlagsConfig | null>(null);
const memoryFlagsAtom = atom<Record<string, FlagResult>>({});
const pendingFlagsAtom = atom<Set<string>>(new Set<string>());

export interface FlagsProviderProps extends FlagsConfig {
	children: ReactNode;
}

export function FlagsProvider({ children, ...config }: FlagsProviderProps) {
	const debug = config.debug ?? false;

	if (debug) {
		console.log('[Databuddy Flags] Provider rendering with config:', {
			clientId: config.clientId,
			debug,
			isPending: config.isPending,
			hasUser: !!config.user,
		});
	}

	useEffect(() => {
		const configWithDefaults = {
			clientId: config.clientId,
			apiUrl: config.apiUrl ?? 'https://api.databuddy.cc',
			user: config.user,
			disabled: config.disabled ?? false,
			debug,
			skipStorage: config.skipStorage ?? false,
			isPending: config.isPending,
			autoFetch: config.autoFetch !== false,
		};

		flagsStore.set(configAtom, configWithDefaults);

		if (debug) {
			console.log('[Databuddy Flags] Config set on store', {
				clientId: config.clientId,
				apiUrl: configWithDefaults.apiUrl,
				user: config.user,
				isPending: config.isPending,
				skipStorage: config.skipStorage ?? false,
			});
		}

		if (!(config.skipStorage ?? false)) {
			loadCachedFlagsImmediate(configWithDefaults);
			flagStorage.cleanupExpired().catch(() => {});
		}
	}, [
		config.clientId,
		config.apiUrl,
		config.user?.userId,
		config.user?.email,
		config.disabled,
		config.debug,
		config.skipStorage,
		config.isPending,
		config.autoFetch,
	]);

	const loadCachedFlagsImmediate = (config: FlagsConfig) => {
		if (config.skipStorage) {
			return;
		}

		flagStorage
			.getAll()
			.then((cachedFlags) => {
				if (Object.keys(cachedFlags).length > 0) {
					flagsStore.set(
						memoryFlagsAtom,
						cachedFlags as Record<string, FlagResult>
					);
					if (config.debug) {
						console.log(
							'[Databuddy Flags] Loaded cached flags:',
							Object.keys(cachedFlags)
						);
					}
				}
			})
			.catch((err) => {
				if (config.debug) {
					console.warn('[Databuddy Flags] Error loading cached flags:', err);
				}
			});
	};

	return createElement(Provider, { store: flagsStore }, children);
}

export function useFlags() {
	const [config] = useAtom(configAtom, { store: flagsStore });
	const [memoryFlags, setMemoryFlags] = useAtom(memoryFlagsAtom, {
		store: flagsStore,
	});
	const [pendingFlags, setPendingFlags] = useAtom(pendingFlagsAtom, {
		store: flagsStore,
	});

	if (config?.debug) {
		console.log('[Databuddy Flags] useFlags called with config:', {
			hasConfig: !!config,
			clientId: config?.clientId,
			isPending: config?.isPending,
			debug: config?.debug,
			skipStorage: config?.skipStorage,
			memoryFlagsCount: Object.keys(memoryFlags).length,
			memoryFlags: Object.keys(memoryFlags),
		});
	}

	const fetchAllFlags = async (): Promise<void> => {
		if (!config) {
			console.warn('[Databuddy Flags] No config for bulk fetch');
			return;
		}

		if (config.isPending) {
			if (config.debug) {
				console.log('[Databuddy Flags] Session pending, skipping bulk fetch');
			}
			return;
		}

		const params = new URLSearchParams();
		params.set('clientId', config.clientId);
		if (config.user?.userId) {
			params.set('userId', config.user.userId);
		}
		if (config.user?.email) {
			params.set('email', config.user.email);
		}
		if (config.user?.properties) {
			params.set('properties', JSON.stringify(config.user.properties));
		}

		const url = `${config.apiUrl}/public/v1/flags/bulk?${params.toString()}`;

		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const result = await response.json();

			if (config.debug) {
				console.log('[Databuddy Flags] Bulk fetch response:', result);
			}

			if (result.flags) {
				setMemoryFlags(result.flags);

				if (!config.skipStorage) {
					try {
						await flagStorage.setAll(result.flags);
						if (config.debug) {
							console.log('[Databuddy Flags] Bulk flags synced to cache');
						}
					} catch (err) {
						if (config.debug) {
							console.warn('[Databuddy Flags] Bulk storage error:', err);
						}
					}
				}
			}
		} catch (err) {
			if (config.debug) {
				console.error('[Databuddy Flags] Bulk fetch error:', err);
			}
		}
	};

	const fetchFlag = async (key: string): Promise<FlagResult> => {
		if (!config) {
			console.warn(`[Databuddy Flags] No config for flag: ${key}`);
			return {
				enabled: false,
				value: false,
				payload: null,
				reason: 'NO_CONFIG',
			};
		}

		setPendingFlags((prev: Set<string>) => new Set([...prev, key]));

		const params = new URLSearchParams();
		params.set('key', key);
		params.set('clientId', config.clientId);
		if (config.user?.userId) {
			params.set('userId', config.user.userId);
		}
		if (config.user?.email) {
			params.set('email', config.user.email);
		}
		if (config.user?.properties) {
			params.set('properties', JSON.stringify(config.user.properties));
		}

		const url = `${config.apiUrl}/public/v1/flags/evaluate?${params.toString()}`;

		if (config.debug) {
			console.log(`[Databuddy Flags] Fetching: ${key}`);
		}

		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const result: FlagResult = await response.json();

			if (config.debug) {
				console.log(`[Databuddy Flags] Response for ${key}:`, result);
			}

			setMemoryFlags((prev) => ({ ...prev, [key]: result }));

			if (!config.skipStorage) {
				try {
					await flagStorage.set(key, result);
					if (config.debug) {
						console.log(`[Databuddy Flags] Cached: ${key}`);
					}
				} catch (err) {
					if (config.debug) {
						console.warn(`[Databuddy Flags] Cache error: ${key}`, err);
					}
				}
			}

			return result;
		} catch (err) {
			if (config.debug) {
				console.error(`[Databuddy Flags] Fetch error: ${key}`, err);
			}

			const fallback = {
				enabled: false,
				value: false,
				payload: null,
				reason: 'ERROR',
			};
			setMemoryFlags((prev) => ({ ...prev, [key]: fallback }));
			return fallback;
		} finally {
			setPendingFlags((prev: Set<string>) => {
				const newSet = new Set(prev);
				newSet.delete(key);
				return newSet;
			});
		}
	};

	const getFlag = async (key: string): Promise<FlagResult> => {
		if (config?.debug) {
			console.log(`[Databuddy Flags] Getting: ${key}`);
		}

		if (config?.isPending) {
			if (config?.debug) {
				console.log(`[Databuddy Flags] Session pending for: ${key}`);
			}
			return {
				enabled: false,
				value: false,
				payload: null,
				reason: 'SESSION_PENDING',
			};
		}

		if (memoryFlags[key]) {
			if (config?.debug) {
				console.log(`[Databuddy Flags] Memory: ${key}`);
			}
			return memoryFlags[key];
		}

		if (pendingFlags.has(key)) {
			if (config?.debug) {
				console.log(`[Databuddy Flags] Pending: ${key}`);
			}
			return {
				enabled: false,
				value: false,
				payload: null,
				reason: 'FETCHING',
			};
		}

		if (!config?.skipStorage) {
			try {
				const cached = await flagStorage.get(key);
				if (cached) {
					if (config?.debug) {
						console.log(`[Databuddy Flags] Cache: ${key}`);
					}
					setMemoryFlags((prev) => ({ ...prev, [key]: cached }));
					return cached;
				}
			} catch (err) {
				if (config?.debug) {
					console.warn(`[Databuddy Flags] Storage error: ${key}`, err);
				}
			}
		}

		return fetchFlag(key);
	};

	const isEnabled = (key: string): FlagState => {
		if (memoryFlags[key]) {
			return {
				enabled: memoryFlags[key].enabled,
				isLoading: false,
				isReady: true,
			};
		}
		if (pendingFlags.has(key)) {
			return {
				enabled: false,
				isLoading: true,
				isReady: false,
			};
		}
		getFlag(key);
		return {
			enabled: false,
			isLoading: true,
			isReady: false,
		};
	};

	const refresh = async (forceClear = false): Promise<void> => {
		if (config?.debug) {
			console.log('[Databuddy Flags] Refreshing', { forceClear });
		}

		if (forceClear) {
			setMemoryFlags({});
			if (!config?.skipStorage) {
				try {
					await flagStorage.clear();
					if (config?.debug) {
						console.log('[Databuddy Flags] Storage cleared');
					}
				} catch (err) {
					if (config?.debug) {
						console.warn('[Databuddy Flags] Storage clear error:', err);
					}
				}
			}
		}

		await fetchAllFlags();
	};

	const updateUser = (user: FlagsConfig['user']) => {
		if (config) {
			flagsStore.set(configAtom, { ...config, user });
			refresh();
		}
	};

	useEffect(() => {
		if (config && !config.isPending && config.autoFetch !== false) {
			if (config.debug) {
				console.log('[Databuddy Flags] Auto-fetching');
			}
			fetchAllFlags();
		}
	}, [
		config?.clientId,
		config?.user?.userId,
		config?.user?.email,
		config?.isPending,
		config?.autoFetch,
	]);

	return {
		isEnabled,
		fetchAllFlags,
		updateUser,
		refresh,
	};
}
