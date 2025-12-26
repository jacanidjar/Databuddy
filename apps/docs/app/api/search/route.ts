import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/lib/source";

export const dynamic = "force-dynamic";

// Lazy initialization to avoid build-time errors with async source
let searchHandler: ReturnType<typeof createFromSource> | null = null;

function getSearchHandler() {
	if (!searchHandler) {
		searchHandler = createFromSource(source);
	}
	return searchHandler;
}

export function GET(request: Request) {
	const handler = getSearchHandler();
	return handler.GET(request);
}
