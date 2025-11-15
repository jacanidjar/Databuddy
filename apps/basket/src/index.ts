import "./polyfills/compression";

import { opentelemetry } from "@elysiajs/opentelemetry";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { Elysia } from "elysia";
import { logger } from "./lib/logger";
import { getProducerStats } from "./lib/producer";
import basketRouter from "./routes/basket";
import emailRouter from "./routes/email";

function getKafkaHealth() {
	const stats = getProducerStats();

	if (!stats.kafkaEnabled) {
		return {
			status: "disabled",
			enabled: false,
		};
	}

	if (stats.connected) {
		return {
			status: "healthy",
			enabled: true,
			connected: true,
		};
	}

	return {
		status: "unhealthy",
		enabled: true,
		connected: false,
		failed: stats.failed,
		lastErrorTime: stats.lastErrorTime,
	};
}

const app = new Elysia()
	.use(
		opentelemetry({
			serviceName: "basket",
			spanProcessors: [
				new BatchSpanProcessor(
					new OTLPTraceExporter({
						url: "https://api.axiom.co/v1/traces",
						headers: {
							Authorization: `Bearer ${process.env.AXIOM_TOKEN}`,
							"X-Axiom-Dataset": process.env.AXIOM_DATASET ?? "basket",
						},
					})
				),
			],
		})
	)
	.onError(function handleError({ error, code }) {
		if (code === "NOT_FOUND") {
			return new Response(null, { status: 404 });
		}
		logger.error({ error }, "Error in basket service");
	})
	.onBeforeHandle(function handleCors({ request, set }) {
		const origin = request.headers.get("origin");
		if (origin) {
			set.headers ??= {};
			set.headers["Access-Control-Allow-Origin"] = origin;
			set.headers["Access-Control-Allow-Methods"] =
				"POST, GET, OPTIONS, PUT, DELETE";
			set.headers["Access-Control-Allow-Headers"] =
				"Content-Type, Authorization, X-Requested-With, databuddy-client-id, databuddy-sdk-name, databuddy-sdk-version";
			set.headers["Access-Control-Allow-Credentials"] = "true";
		}
	})
	.options("*", () => new Response(null, { status: 204 }))
	.use(basketRouter)
	.use(emailRouter)
	.get("/health", function healthCheck() {
		return {
			status: "ok",
			version: "1.0.0",
			producer_stats: getProducerStats(),
			kafka: getKafkaHealth(),
		};
	});

const port = process.env.PORT || 4000;

console.log(`Starting basket service on port ${port}`);

export default {
	fetch: app.fetch,
	port,
};
