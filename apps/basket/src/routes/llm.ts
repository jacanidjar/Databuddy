import { insertAICallSpans } from "@lib/event-service";
import { validateRequest } from "@lib/request-validation";
import { captureError } from "@lib/tracing";
import { Elysia } from "elysia";
import { z } from "zod";

const aiCallSchema = z.object({
	timestamp: z.union([z.date(), z.number(), z.string()]),
	type: z.enum(["generate", "stream"]),
	model: z.string(),
	provider: z.string(),
	finishReason: z.string().optional(),
	usage: z.object({
		inputTokens: z.number(),
		outputTokens: z.number(),
		totalTokens: z.number(),
		cachedInputTokens: z.number().optional(),
	}),
	cost: z.object({
		inputTokenCostUSD: z.number().optional(),
		outputTokenCostUSD: z.number().optional(),
		totalTokenCostUSD: z.number().optional(),
	}),
	tools: z.object({
		toolCallCount: z.number(),
		toolResultCount: z.number(),
		toolCallNames: z.array(z.string()),
	}),
	error: z
		.object({
			name: z.string(),
			message: z.string(),
			stack: z.string().optional(),
		})
		.optional(),
	durationMs: z.number(),
});

const app = new Elysia().post("/llm", async (context) => {
	const { body, query, request } = context as {
		body: unknown;
		query: Record<string, string>;
		request: Request;
	};

	try {
		const validation = await validateRequest(body, query, request);
		if ("error" in validation) {
			return validation.error;
		}

		const { clientId } = validation;

		// Support both single call and array of calls
		const parseResult = z
			.union([aiCallSchema, z.array(aiCallSchema)])
			.safeParse(body);

		if (!parseResult.success) {
			return new Response(
				JSON.stringify({
					status: "error",
					message: "Invalid request body",
					issues: parseResult.error.issues,
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		const calls = Array.isArray(parseResult.data)
			? parseResult.data
			: [parseResult.data];

		const now = Date.now();
		const spans = calls.map((call) => {
			const timestamp =
				typeof call.timestamp === "number"
					? call.timestamp
					: call.timestamp instanceof Date
						? call.timestamp.getTime()
						: new Date(call.timestamp).getTime();

			return {
				website_id: clientId,
				timestamp: timestamp || now,
				type: call.type,
				model: call.model,
				provider: call.provider,
				finish_reason: call.finishReason,
				input_tokens: call.usage.inputTokens,
				output_tokens: call.usage.outputTokens,
				total_tokens: call.usage.totalTokens,
				cached_input_tokens: call.usage.cachedInputTokens,
				input_token_cost_usd: call.cost.inputTokenCostUSD,
				output_token_cost_usd: call.cost.outputTokenCostUSD,
				total_token_cost_usd: call.cost.totalTokenCostUSD,
				tool_call_count: call.tools.toolCallCount,
				tool_result_count: call.tools.toolResultCount,
				tool_call_names: call.tools.toolCallNames,
				duration_ms: call.durationMs,
				error_name: call.error?.name,
				error_message: call.error?.message,
				error_stack: call.error?.stack,
			};
		});

		await insertAICallSpans(spans, clientId);

		return new Response(
			JSON.stringify({
				status: "success",
				type: "ai_call",
				count: spans.length,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		captureError(error, { message: "Error processing AI call" });
		return new Response(
			JSON.stringify({ status: "error", message: "Internal server error" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
});

export default app;
