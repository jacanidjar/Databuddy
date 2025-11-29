import { type Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";
import type { BaseTracker } from "../core/tracker";
import type { WebVitalMetricName } from "../core/types";
import { logger } from "../core/utils";

type FPSMetric = {
	name: "FPS";
	value: number;
};

const onFPS = (callback: (metric: FPSMetric) => void) => {
	if (typeof window === "undefined") {
		return;
	}

	let frames = 0;
	const start = performance.now();
	const duration = 2000;

	const countFrame = () => {
		frames += 1;
		if (performance.now() - start < duration) {
			requestAnimationFrame(countFrame);
		} else {
			callback({ name: "FPS", value: Math.round((frames / duration) * 1000) });
		}
	};

	if (document.readyState === "complete") {
		requestAnimationFrame(countFrame);
	} else {
		window.addEventListener("load", () => requestAnimationFrame(countFrame), { once: true });
	}
};

export function initWebVitalsTracking(tracker: BaseTracker) {
	if (tracker.isServer()) {
		return;
	}

	const sentMetrics = new Set<WebVitalMetricName>();

	const handleMetric = (metric: Metric | FPSMetric) => {
		const name = metric.name as WebVitalMetricName;
		if (sentMetrics.has(name)) {
			return;
		}
		sentMetrics.add(name);

		const value = name === "CLS" ? metric.value : Math.round(metric.value);
		logger.log(`Web Vital captured: ${name}`, value);

		tracker.sendVital({
			name: "web_vital",
			eventId: crypto.randomUUID(),
			timestamp: Date.now(),
			path: window.location.pathname,
			metricName: name,
			metricValue: value,
		});
	};

	onFCP(handleMetric);
	onLCP(handleMetric);
	onCLS(handleMetric);
	onINP(handleMetric);
	onTTFB(handleMetric);
	onFPS(handleMetric);
}
