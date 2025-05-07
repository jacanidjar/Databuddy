import type { DatabuddyConfig, EventProperties, PageViewProperties } from './types';

/**
 * Databuddy SDK for web analytics tracking
 * 
 * @example
 * ```typescript
 * const databuddy = new Databuddy({
 *   clientId: 'your-client-id',
 *   trackScreenViews: true,
 *   trackPerformance: true
 * });
 * 
 * databuddy.init();
 * databuddy.track('button_clicked', { buttonId: 'submit' });
 * ```
 */
export class Databuddy {
  private config: DatabuddyConfig;
  private initialized = false;

  /**
   * Creates a new Databuddy instance
   * @param config - Configuration options for the SDK
   */
  constructor(config: DatabuddyConfig) {
    this.config = {
      apiUrl: 'https://api.databuddy.cc',
      sdk: 'web',
      sdkVersion: '1.0.0',
      trackScreenViews: true,
      trackPerformance: true,
      trackWebVitals: true,
      trackErrors: true,
      enableBatching: true,
      batchSize: 20,
      batchTimeout: 5000,
      ...config
    };
  }

  /**
   * Initializes the SDK by injecting the tracking script
   * This should be called once when your application starts
   */
  public init(): void {
    if (this.initialized) return;
    
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src = `${this.config.apiUrl?.replace('api.', '')}/databuddy.js`;
    script.async = true;
    
    // Set data attributes from config
    for (const [key, value] of Object.entries(this.config)) {
      if (value !== undefined) {
        const dataKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        script.setAttribute(`data-${dataKey}`, String(value));
      }
    }

    document.head.appendChild(script);
    this.initialized = true;
  }

  /**
   * Tracks a custom event
   * @param eventName - Name of the event to track
   * @param properties - Optional properties to attach to the event
   */
  public track(eventName: string, properties?: EventProperties): void {
    if (typeof window === 'undefined' || !window.databuddy) return;
    window.databuddy.track(eventName, properties);
  }

  /**
   * Tracks a screen/page view
   * @param properties - Optional properties to attach to the screen view
   */
  public screenView(properties?: PageViewProperties): void {
    if (typeof window === 'undefined' || !window.databuddy) return;
    window.databuddy.screenView(properties);
  }

  /**
   * Increments a metric counter
   * @param name - Name of the metric to increment
   * @param value - Value to increment by (defaults to 1)
   * @param properties - Optional properties to attach to the metric
   */
  public increment(name: string, value = 1, properties?: EventProperties): void {
    if (typeof window === 'undefined' || !window.databuddy) return;
    window.databuddy.increment({ name, value, properties });
  }

  /**
   * Decrements a metric counter
   * @param name - Name of the metric to decrement
   * @param value - Value to decrement by (defaults to 1)
   * @param properties - Optional properties to attach to the metric
   */
  public decrement(name: string, value = 1, properties?: EventProperties): void {
    if (typeof window === 'undefined' || !window.databuddy) return;
    window.databuddy.decrement({ name, value, properties });
  }

  /**
   * Clears the current user's session and generates new IDs
   * Useful for handling user logout or privacy requests
   */
  public clear(): void {
    if (typeof window === 'undefined' || !window.databuddy) return;
    window.databuddy.clear();
  }
}

// Add type declaration for the global window object
declare global {
  interface Window {
    databuddy: {
      track: (eventName: string, properties?: EventProperties) => void;
      screenView: (properties?: PageViewProperties) => void;
      increment: (data: { name: string; value: number; properties?: EventProperties }) => void;
      decrement: (data: { name: string; value: number; properties?: EventProperties }) => void;
      clear: () => void;
    };
  }
} 