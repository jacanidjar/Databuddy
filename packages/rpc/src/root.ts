import { annotationsRouter } from "./routers/annotations";
import { apikeysRouter } from "./routers/apikeys";
import { assistantRouter } from "./routers/assistant";
import { autocompleteRouter } from "./routers/autocomplete";
import { billingRouter } from "./routers/billing";
import { chatRouter } from "./routers/chat";
import { flagsRouter } from "./routers/flags";
import { funnelsRouter } from "./routers/funnels";
import { goalsRouter } from "./routers/goals";
import { integrationsRouter } from "./routers/integrations";
import { miniChartsRouter } from "./routers/mini-charts";
import { organizationsRouter } from "./routers/organizations";
import { preferencesRouter } from "./routers/preferences";
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
	integrations: integrationsRouter,
	billing: billingRouter,
};

export type AppRouter = typeof appRouter;
