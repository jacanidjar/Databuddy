import { annotationsRouter } from "./routers/annotations";
import { apikeysRouter } from "./routers/apikeys";
import { assistantRouter } from "./routers/assistant";
import { autocompleteRouter } from "./routers/autocomplete";
import { billingRouter } from "./routers/billing";
import { chatRouter } from "./routers/chat";
import { dbConnectionsRouter } from "./routers/db-connections";
import { flagsRouter } from "./routers/flags";
import { funnelsRouter } from "./routers/funnels";
import { goalsRouter } from "./routers/goals";
import { integrationsRouter } from "./routers/integrations";
import { miniChartsRouter } from "./routers/mini-charts";
import { organizationsRouter } from "./routers/organizations";
import { performanceRouter } from "./routers/performance";
import { preferencesRouter } from "./routers/preferences";
import { vercelRouter } from "./routers/vercel";
import { websitesRouter } from "./routers/websites";

export const appRouter = {
	annotations: annotationsRouter,
	websites: websitesRouter,
	miniCharts: miniChartsRouter,
	funnels: funnelsRouter,
	preferences: preferencesRouter,
	goals: goalsRouter,
	autocomplete: autocompleteRouter,
	apikeys: apikeysRouter,
	flags: flagsRouter,
	assistant: assistantRouter,
	chat: chatRouter,
	organizations: organizationsRouter,
	dbConnections: dbConnectionsRouter,
	performance: performanceRouter,
	integrations: integrationsRouter,
	vercel: vercelRouter,
	billing: billingRouter,
};

export type AppRouter = typeof appRouter;
