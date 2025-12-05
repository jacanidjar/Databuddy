import { models } from "../config";
import { buildReflectionInstructions } from "../prompts/reflection";
import { createAgent } from "./factory";
import { analyticsAgent } from "./analytics";
import { funnelsAgent } from "./funnels";

/**
 * Reflection agent that reviews responses, decides next steps,
 * and can redirect to other agents for deeper investigation.
 * 
 * This agent acts as a meta-orchestrator that:
 * - Reflects on agent responses to determine if more data is needed
 * - Handles complex multi-step reasoning workflows
 * - Synthesizes information from multiple sources
 * - Provides clear explanations to users
 * - Can hand off to analytics/funnels agents for data gathering
 */
export const reflectionAgent = createAgent({
    name: "reflection",
    model: models.advanced,
    temperature: 0.2,
    instructions: buildReflectionInstructions,
    handoffs: [analyticsAgent, funnelsAgent],
    maxTurns: 15,
});

