/**
 * Configuration options for the Databuddy SDK and <Databuddy /> component.
 * All options are passed as data attributes to the injected script.
 */
export interface DatabuddyConfig {
  /**
   * Your Databuddy project client ID (required).
   * Get this from your Databuddy dashboard.
   * Example: '3ed1fce1-5a56-4cbc-a917-66864f6d18e3'
   */
  clientId: string;

  /**
   * (Advanced) Your Databuddy client secret for server-side operations.
   * Not required for browser usage.
   */
  clientSecret?: string;

  /**
   * Custom API endpoint for event ingestion.
   * Default: 'https://api.databuddy.cc'
   */
  apiUrl?: string;

  /**
   * Custom script URL for the Databuddy browser bundle.
   * Default: 'https://app.databuddy.cc/databuddy.js'
   */
  scriptUrl?: string;

  /**
   * SDK name for analytics (default: 'web').
   * Only override if you are building a custom integration.
   */
  sdk?: string;

  /**
   * SDK version (defaults to package.json version).
   * Only override for custom builds.
   */
  sdkVersion?: string;

  /**
   * Disable all tracking (default: false).
   * If true, no events will be sent.
   */
  disabled?: boolean;

  /**
   * Wait for user profile before sending events (advanced, default: false).
   */
  waitForProfile?: boolean;

  // --- Tracking Features ---

  /**
   * Automatically track screen/page views (default: true).
   */
  trackScreenViews?: boolean;

  /**
   * Track hash changes in the URL (default: false).
   */
  trackHashChanges?: boolean;

  /**
   * Track data-* attributes on elements (default: false).
   */
  trackAttributes?: boolean;

  /**
   * Track clicks on outgoing links (default: false).
   */
  trackOutgoingLinks?: boolean;

  /**
   * Track user sessions (default: false).
   */
  trackSessions?: boolean;

  /**
   * Track page performance metrics (default: true).
   */
  trackPerformance?: boolean;

  /**
   * Track Web Vitals metrics (default: true).
   */
  trackWebVitals?: boolean;

  /**
   * Track user engagement metrics (default: false).
   */
  trackEngagement?: boolean;

  /**
   * Track scroll depth (default: false).
   */
  trackScrollDepth?: boolean;

  /**
   * Track exit intent (default: false).
   */
  trackExitIntent?: boolean;

  /**
   * Track user interactions (default: false).
   */
  trackInteractions?: boolean;

  /**
   * Track JavaScript errors (default: true).
   */
  trackErrors?: boolean;

  /**
   * Track bounce rate (default: false).
   */
  trackBounceRate?: boolean;

  // --- Advanced/Performance ---

  /**
   * Sampling rate for events (0.0 to 1.0, default: 1.0).
   * Example: 0.5 = 50% of events sent.
   */
  samplingRate?: number;

  /**
   * Enable retries for failed requests (default: true).
   */
  enableRetries?: boolean;

  /**
   * Maximum number of retries for failed requests (default: 3).
   * Only used if enableRetries is true.
   */
  maxRetries?: number;

  /**
   * Initial retry delay in milliseconds (default: 500).
   * Only used if enableRetries is true.
   */
  initialRetryDelay?: number;

  /**
   * Enable event batching (default: true).
   */
  enableBatching?: boolean;

  /**
   * Number of events to batch before sending (default: 20).
   * Only used if enableBatching is true.
   * Min: 1, Max: 50
   */
  batchSize?: number;

  /**
   * Batch timeout in milliseconds (default: 5000).
   * Only used if enableBatching is true.
   * Min: 100, Max: 30000
   */
  batchTimeout?: number;
}

/**
 * Event properties that can be attached to any event
 */
export interface EventProperties {
  /** Custom properties for the event */
  [key: string]: string | number | boolean | null | undefined | EventProperties;
}

