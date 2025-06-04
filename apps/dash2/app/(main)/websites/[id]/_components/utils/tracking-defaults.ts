import type { TrackingOptions } from "./types";

// Library defaults - what the actual tracking library uses when no options are provided
export const ACTUAL_LIBRARY_DEFAULTS: TrackingOptions = {
  trackErrors: false,
  trackPerformance: true,
  trackWebVitals: false,
  trackOutgoingLinks: false,
  trackScreenViews: true,
  trackSessions: true,
  trackInteractions: false,
  samplingRate: 1.0,
  enableRetries: true,
  maxRetries: 3,
  initialRetryDelay: 500
};

// Recommended defaults for new users - what we suggest they start with
export const RECOMMENDED_DEFAULTS: TrackingOptions = {
  trackErrors: false,
  trackPerformance: true,
  trackWebVitals: false,
  trackOutgoingLinks: false,
  trackScreenViews: true,
  trackSessions: true,
  trackInteractions: false,
  samplingRate: 1.0,
  enableRetries: true,
  maxRetries: 3,
  initialRetryDelay: 500
}; 