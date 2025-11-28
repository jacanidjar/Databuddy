import { type Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";
import type { BaseTracker } from "../core/tracker";
import { logger } from "../core/utils";

type WebVitalMetricName = "FCP" | "LCP" | "CLS" | "INP" | "TTFB";

type WebVitalSpan = {
	sessionId: string;
	timestamp: number;
	path: string;
	metricName: WebVitalMetricName;
	metricValue: number;
};

export function initWebVitalsTracking(tracker: BaseTracker) {
	if (tracker.isServer()) {
		return;
	}

	const sentMetrics = new Set<WebVitalMetricName>();

	const sendVitalSpan = (metricName: WebVitalMetricName, metricValue: number) => {
		if (sentMetrics.has(metricName)) {
			return;
		}
		sentMetrics.add(metricName);

		const span: WebVitalSpan = {
			sessionId: tracker.sessionId ?? "",
			timestamp: Date.now(),
			path: window.location.pathname,
			metricName,
			metricValue,
		};

		logger.log(`Sending web vital span: ${metricName}`, span);
		tracker.sendBeacon(span);
	};

	const handleMetric = (metric: Metric) => {
		const name = metric.name as WebVitalMetricName;
		const value = name === "CLS" ? metric.value : Math.round(metric.value);

		logger.log(`Web Vital captured: ${name}`, value);
		sendVitalSpan(name, value);
	};

	onFCP(handleMetric);
	onLCP(handleMetric);
	onCLS(handleMetric);
	onINP(handleMetric);
	onTTFB(handleMetric);
}
