import { and, db, eq, isNull, links } from "@databuddy/db";
import {
	type CachedLink,
	getCachedLink,
	setCachedLink,
	setCachedLinkNotFound,
} from "@databuddy/redis";
import { Elysia, redirect, t } from "elysia";
import { sendLinkVisit } from "../lib/producer";
import { extractIp, getGeo } from "../utils/geo";
import { hashIp } from "../utils/hash";
import { parseUserAgent } from "../utils/user-agent";

async function getLinkBySlug(slug: string): Promise<CachedLink | null> {
	// Try cache first
	const cached = await getCachedLink(slug).catch(() => null);
	if (cached) {
		return cached;
	}

	// Fetch from database
	const dbLink = await db.query.links.findFirst({
		where: and(eq(links.slug, slug), isNull(links.deletedAt)),
		columns: {
			id: true,
			targetUrl: true,
		},
	});

	if (!dbLink) {
		// Cache negative result with short TTL
		await setCachedLinkNotFound(slug).catch(() => { });
		return null;
	}

	const link: CachedLink = {
		id: dbLink.id,
		targetUrl: dbLink.targetUrl,
	};

	// Cache the result
	await setCachedLink(slug, link).catch(() => { });

	return link;
}

export const redirectRoute = new Elysia().get(
	"/:slug",
	async ({ params, request }) => {
		const link = await getLinkBySlug(params.slug);

		if (!link) {
			return Response.json({ error: "Link not found" }, { status: 404 });
		}

		const referrer = request.headers.get("referer");
		const userAgent = request.headers.get("user-agent");
		const ip = extractIp(request);

		const [geo, ua] = await Promise.all([
			getGeo(ip),
			Promise.resolve(parseUserAgent(userAgent)),
		]);

		sendLinkVisit(
			{
				link_id: link.id,
				timestamp: new Date()
					.toISOString()
					.replace("T", " ")
					.replace("Z", ""),
				referrer,
				user_agent: userAgent,
				ip_hash: hashIp(ip),
				country: geo.country,
				region: geo.region,
				city: geo.city,
				browser_name: ua.browserName,
				device_type: ua.deviceType,
			},
			link.id
		).catch((err) => console.error("Failed to track visit:", err));

		return redirect(link.targetUrl, 302);
	},
	{
		params: t.Object({
			slug: t.String(),
		}),
	}
);
