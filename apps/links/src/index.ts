import { Elysia } from "elysia";
import { disconnectProducer } from "./lib/producer";
import { redirectRoute } from "./routes/redirect";

const app = new Elysia()
	.get("/", () => ({ status: "ok" }))
	.get("/health", () => ({ status: "ok" }))
	.use(redirectRoute);

process.on("SIGTERM", async () => {
	console.log("SIGTERM received, shutting down gracefully...");
	await disconnectProducer();
	process.exit(0);
});

process.on("SIGINT", async () => {
	console.log("SIGINT received, shutting down gracefully...");
	await disconnectProducer();
	process.exit(0);
});

export default {
	port: 2500,
	fetch: app.fetch,
};