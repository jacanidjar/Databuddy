/**
 * Configuration options for the Databuddy SDK
 */
export interface DatabuddyConfig {
  /** Required: Your Databuddy client ID */
  clientId: string;
  /** Optional: Your Databuddy client secret for server-side operations */
  clientSecret?: string;
  /** Optional: Custom API URL (defaults to https://api.databuddy.cc) */
  apiUrl?: string;
  /** Optional: SDK name (defaults to 'web') */
  sdk?: string;
  /** Optional: SDK version (defaults to '1.0.0') */
  sdkVersion?: string;
  /** Optional: Disable tracking completely */
  disabled?: boolean;
  /** Optional: Wait for user profile before sending events */
  waitForProfile?: boolean;
  /** Optional: Track screen/page views automatically (defaults to true) */
  trackScreenViews?: boolean;
  /** Optional: Track hash changes in URL */
  trackHashChanges?: boolean;
  /** Optional: Track data-* attributes on elements */
  trackAttributes?: boolean;
  /** Optional: Track outgoing link clicks */
  trackOutgoingLinks?: boolean;
  /** Optional: Track user sessions */
  trackSessions?: boolean;
  /** Optional: Track page performance metrics (defaults to true) */
  trackPerformance?: boolean;
  /** Optional: Track Web Vitals metrics (defaults to true) */
  trackWebVitals?: boolean;
  /** Optional: Track user engagement metrics */
  trackEngagement?: boolean;
  /** Optional: Track scroll depth */
  trackScrollDepth?: boolean;
  /** Optional: Track exit intent */
  trackExitIntent?: boolean;
  /** Optional: Track user interactions */
  trackInteractions?: boolean;
  /** Optional: Track JavaScript errors (defaults to true) */
  trackErrors?: boolean;
  /** Optional: Track bounce rate */
  trackBounceRate?: boolean;
  /** Optional: Sampling rate for events (0.0 to 1.0) */
  samplingRate?: number;
  /** Optional: Enable retries for failed requests */
  enableRetries?: boolean;
  /** Optional: Maximum number of retries (defaults to 3) */
  maxRetries?: number;
  /** Optional: Initial retry delay in milliseconds (defaults to 500) */
  initialRetryDelay?: number;
  /** Optional: Enable event batching (defaults to true) */
  enableBatching?: boolean;
  /** Optional: Number of events to batch (defaults to 20) */
  batchSize?: number;
  /** Optional: Batch timeout in milliseconds (defaults to 5000) */
  batchTimeout?: number;
  /** Optional: Anonymize user data */
  anonymized?: boolean;
}

/**
 * Event properties that can be attached to any event
 */
export interface EventProperties {
  /** Custom properties for the event */
  [key: string]: string | number | boolean | null | undefined | EventProperties;
}

/**
 * Base event interface
 */
export interface BaseEvent {
  /** Event type */
  type: string;
  /** Event payload */
  payload: {
    /** Event name */
    name: string;
    /** Anonymous user ID */
    anonymousId: string;
    /** Event properties */
    properties?: EventProperties;
  };
}

/**
 * Track event for custom events
 */
export interface TrackEvent extends BaseEvent {
  type: 'track';
}

/**
 * Metric event payload
 */
export interface MetricEventPayload {
  /** Event name */
  name: string;
  /** Anonymous user ID */
  anonymousId: string;
  /** Metric value */
  value: number;
  /** Event properties */
  properties?: EventProperties;
}

/**
 * Increment event for metrics
 */
export interface IncrementEvent {
  type: 'increment';
  payload: MetricEventPayload;
}

/**
 * Decrement event for metrics
 */
export interface DecrementEvent {
  type: 'decrement';
  payload: MetricEventPayload;
}

/**
 * Union type of all possible events
 */
export type DatabuddyEvent = TrackEvent | IncrementEvent | DecrementEvent;

/**
 * Web Vitals metrics
 */
export interface WebVitals {
  /** First Contentful Paint in milliseconds */
  fcp?: number;
  /** Largest Contentful Paint in milliseconds */
  lcp?: number;
  /** Cumulative Layout Shift score */
  cls?: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  /** Total page load time in milliseconds */
  load_time?: number;
  /** DOM ready time in milliseconds */
  dom_ready_time?: number;
  /** Time to First Byte in milliseconds */
  ttfb?: number;
  /** Request time in milliseconds */
  request_time?: number;
  /** Render time in milliseconds */
  render_time?: number;
}

/**
 * Page view properties
 */
export interface PageViewProperties extends EventProperties {
  /** Page path */
  __path: string;
  /** Page title */
  __title: string;
  /** Referrer URL */
  __referrer?: string;
  /** Timestamp in milliseconds */
  __timestamp_ms: number;
  /** Screen resolution */
  screen_resolution?: string;
  /** Viewport size */
  viewport_size?: string;
  /** Timezone */
  timezone?: string;
  /** Browser language */
  language?: string;
  /** Connection type */
  connection_type?: string;
} 