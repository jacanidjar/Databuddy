import type { TrackingOptions } from "./types";
import { RECOMMENDED_DEFAULTS } from "./tracking-defaults";

/**
 * Toggle a specific tracking option
 */
export function toggleTrackingOption(
  options: TrackingOptions, 
  option: keyof TrackingOptions
): TrackingOptions {
  return {
    ...options,
    [option]: !options[option]
  };
}

/**
 * Enable all options for a specific category
 */
export function enableAllBasicTracking(options: TrackingOptions): TrackingOptions {
  return {
    ...options,
    trackScreenViews: true,
    trackSessions: true,
    trackInteractions: true,
    trackOutgoingLinks: true
  };
}

export function enableAllAdvancedTracking(options: TrackingOptions): TrackingOptions {
  return {
    ...options,
    trackErrors: true,
    trackPerformance: true,
    trackWebVitals: true
  };
}

export function enableAllOptimization(options: TrackingOptions): TrackingOptions {
  return {
    ...options,
    samplingRate: 1.0,
    enableRetries: true,
    maxRetries: 3,
    initialRetryDelay: 500
  };
}

/**
 * Reset options to recommended defaults
 */
export function resetToDefaults(): TrackingOptions {
  return { ...RECOMMENDED_DEFAULTS };
} 