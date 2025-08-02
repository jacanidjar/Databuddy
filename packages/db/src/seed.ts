import { faker } from '@faker-js/faker';
import { clickHouse, TABLE_NAMES } from './clickhouse/client';

const clientId = process.argv[2] || faker.string.uuid();
const domain = process.argv[3] || 'example.com';
const eventCount = Number(process.argv[4]) || 100;

const BROWSERS = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
const OS_NAMES = ['Windows', 'macOS', 'Linux', 'Android', 'iOS'];
const DEVICE_TYPES = ['desktop', 'mobile', 'tablet'];
const EVENT_NAMES = [
	'screen_view',
	'page_exit',
	'click',
	'form_submit',
	'scroll',
	'file_download',
	'video_play',
	'signup',
	'login',
	'purchase',
	'add_to_cart',
	'remove_from_cart',
	'checkout_started',
	'payment_info_added',
	'order_completed',
	'newsletter_signup',
	'contact_form_submit',
	'search',
	'filter_applied',
	'product_viewed',
	'category_viewed',
	'share_content',
	'download_started',
	'video_started',
	'video_completed',
	'comment_posted',
	'rating_given',
	'wishlist_added',
	'coupon_applied',
	'referral_sent',
	'account_created',
	'profile_updated',
	'password_reset',
	'logout',
	'feature_used',
	'help_clicked',
	'feedback_submitted',
];

const BLOG_CATEGORIES = [
	'tech',
	'business',
	'marketing',
	'design',
	'development',
	'startup',
	'ai',
	'saas',
	'mobile',
	'web',
	'data',
	'security',
	'cloud',
	'api',
	'tutorial',
];
const PRODUCT_CATEGORIES = [
	'software',
	'hardware',
	'books',
	'courses',
	'templates',
	'tools',
	'services',
	'consulting',
	'hosting',
	'analytics',
];
const COMPANY_SECTIONS = [
	'about',
	'team',
	'careers',
	'investors',
	'press',
	'contact',
	'support',
	'help',
	'faq',
	'terms',
	'privacy',
	'security',
	'status',
];

function generatePaths() {
	const paths = [
		'/',
		'/home',
		'/pricing',
		'/features',
		'/docs',
		'/api',
		'/login',
		'/signup',
		'/dashboard',
		'/settings',
		'/profile',
		'/search',
		'/checkout',
		'/cart',
		'/wishlist',
	];

	// Company pages
	for (const section of COMPANY_SECTIONS) {
		paths.push(`/${section}`);
	}

	// Blog paths
	for (const category of BLOG_CATEGORIES) {
		paths.push(`/blog/${category}`);
		for (let i = 0; i < 5; i++) {
			const slug = faker.lorem.slug({ min: 2, max: 6 });
			paths.push(`/blog/${category}/${slug}`);
		}
	}

	// Product/service paths
	for (const category of PRODUCT_CATEGORIES) {
		paths.push(`/products/${category}`);
		paths.push(`/services/${category}`);
		for (let i = 0; i < 3; i++) {
			const productName = faker.commerce
				.productName()
				.toLowerCase()
				.replace(/\s+/g, '-');
			paths.push(`/products/${category}/${productName}`);
		}
	}

	// Documentation paths
	const docSections = [
		'getting-started',
		'api-reference',
		'tutorials',
		'examples',
		'guides',
		'troubleshooting',
	];
	for (const section of docSections) {
		paths.push(`/docs/${section}`);
		for (let i = 0; i < 4; i++) {
			const docSlug = faker.lorem.slug({ min: 1, max: 3 });
			paths.push(`/docs/${section}/${docSlug}`);
		}
	}

	// User-generated content
	for (let i = 0; i < 20; i++) {
		const userId = faker.string.alphanumeric(8);
		paths.push(`/user/${userId}`);
		paths.push(`/profile/${userId}`);
	}

	return paths;
}

function generateReferrers() {
	return [
		'direct',
		'https://google.com/search',
		'https://www.google.com/search',
		'https://bing.com/search',
		'https://duckduckgo.com',
		'https://yahoo.com/search',
		'https://facebook.com',
		'https://www.facebook.com',
		'https://twitter.com',
		'https://x.com',
		'https://linkedin.com',
		'https://www.linkedin.com',
		'https://instagram.com',
		'https://reddit.com',
		'https://www.reddit.com',
		'https://youtube.com',
		'https://tiktok.com',
		'https://github.com',
		'https://stackoverflow.com',
		'https://medium.com',
		'https://dev.to',
		'https://hackernews.com',
		'https://producthunt.com',
		'https://indiehackers.com',
		'https://techcrunch.com',
		'https://vercel.com',
		'https://netlify.com',
		'https://aws.amazon.com',
		'https://cloud.google.com',
		'https://azure.microsoft.com',
		'https://digitalocean.com',
		'https://heroku.com',
		'https://railway.app',
		'https://planetscale.com',
		'https://supabase.com',
		'https://clerk.com',
		'https://auth0.com',
		'https://stripe.com',
		'https://paddle.com',
		'https://lemonsqueezy.com',
		'https://gumroad.com',
		'https://mailchimp.com',
		'https://convertkit.com',
		'https://substack.com',
		'https://notion.so',
		'https://airtable.com',
		'https://figma.com',
		'https://canva.com',
		'https://discord.com',
		'https://slack.com',
		'https://telegram.org',
		'https://whatsapp.com',
	];
}

function generateCustomProperties(eventName: string) {
	const baseProps: Record<string, unknown> = {};

	switch (eventName) {
		case 'purchase':
		case 'order_completed':
			return {
				order_id: faker.string.alphanumeric(12),
				total_amount: faker.number.float({
					min: 10,
					max: 500,
					fractionDigits: 2,
				}),
				currency: faker.helpers.arrayElement([
					'USD',
					'EUR',
					'GBP',
					'CAD',
					'AUD',
				]),
				item_count: faker.number.int({ min: 1, max: 5 }),
				payment_method: faker.helpers.arrayElement([
					'card',
					'paypal',
					'apple_pay',
					'google_pay',
				]),
				coupon_used: faker.helpers.maybe(() => faker.lorem.word(), {
					probability: 0.3,
				}),
				shipping_method: faker.helpers.arrayElement([
					'standard',
					'express',
					'overnight',
				]),
			};
		case 'add_to_cart':
		case 'remove_from_cart':
			return {
				product_id: faker.string.alphanumeric(8),
				product_name: faker.commerce.productName(),
				price: faker.number.float({ min: 5, max: 200, fractionDigits: 2 }),
				quantity: faker.number.int({ min: 1, max: 3 }),
				category: faker.helpers.arrayElement(PRODUCT_CATEGORIES),
			};
		case 'search':
			return {
				query: faker.lorem.words({ min: 1, max: 4 }),
				results_count: faker.number.int({ min: 0, max: 100 }),
				filters_applied: faker.helpers.maybe(
					() =>
						faker.helpers.arrayElements(PRODUCT_CATEGORIES, { min: 1, max: 3 }),
					{ probability: 0.4 }
				),
			};
		case 'video_play':
		case 'video_started':
			return {
				video_id: faker.string.alphanumeric(10),
				video_title: faker.lorem.sentence({ min: 3, max: 8 }),
				video_duration: faker.number.int({ min: 30, max: 3600 }),
				quality: faker.helpers.arrayElement(['720p', '1080p', '4k']),
			};
		case 'signup':
		case 'account_created':
			return {
				registration_method: faker.helpers.arrayElement([
					'email',
					'google',
					'github',
					'facebook',
				]),
				referral_code: faker.helpers.maybe(() => faker.string.alphanumeric(8), {
					probability: 0.2,
				}),
				plan_selected: faker.helpers.arrayElement([
					'free',
					'starter',
					'pro',
					'enterprise',
				]),
			};
		case 'form_submit':
		case 'contact_form_submit':
			return {
				form_name: faker.helpers.arrayElement([
					'contact',
					'newsletter',
					'demo_request',
					'support',
				]),
				fields_count: faker.number.int({ min: 2, max: 8 }),
				submission_time: faker.number.int({ min: 15, max: 300 }),
			};
		case 'feature_used':
			return {
				feature_name: faker.helpers.arrayElement([
					'export',
					'import',
					'share',
					'collaborate',
					'analytics',
					'automation',
				]),
				usage_duration: faker.number.int({ min: 5, max: 180 }),
				user_tier: faker.helpers.arrayElement(['free', 'paid', 'trial']),
			};
		default:
			// Random additional properties for any event
			if (faker.datatype.boolean({ probability: 0.3 })) {
				baseProps.experiment_variant = faker.helpers.arrayElement([
					'control',
					'variant_a',
					'variant_b',
				]);
			}
			if (faker.datatype.boolean({ probability: 0.2 })) {
				baseProps.user_segment = faker.helpers.arrayElement([
					'new',
					'returning',
					'premium',
					'trial',
				]);
			}
			return baseProps;
	}
}

const DOT_REGEX = /\.$/;

function generatePageTitle(path: string): string {
	if (path === '/') {
		return 'Home';
	}
	if (path.startsWith('/blog/')) {
		const parts = path.split('/');
		if (parts.length === 3) {
			return `${parts[2].charAt(0).toUpperCase() + parts[2].slice(1)} Blog`;
		}
		return faker.lorem.sentence({ min: 4, max: 8 }).replace(DOT_REGEX, '');
	}
	if (path.startsWith('/products/')) {
		return `${faker.commerce.productName()} - Products`;
	}
	if (path.startsWith('/docs/')) {
		return `Documentation - ${path.split('/').pop()?.replace(/-/g, ' ')}`;
	}
	if (path.startsWith('/user/') || path.startsWith('/profile/')) {
		return `${faker.person.fullName()} - Profile`;
	}

	// Default title generation
	const pathName = path.substring(1).replace(/-/g, ' ').replace(/\//g, ' - ');
	return pathName.charAt(0).toUpperCase() + pathName.slice(1) || 'Page';
}

const PATHS = generatePaths();
const REFERRERS = generateReferrers();

(async () => {
	console.log(
		`Generating ${eventCount} events for client: ${clientId} on domain: ${domain}`
	);

	const events = Array.from({ length: eventCount }, () => {
		const baseTime = faker.date.recent({ days: 30 }).getTime();
		const sessionId = faker.string.uuid();
		const anonymousId = faker.string.uuid();

		const deviceType = faker.helpers.arrayElement(DEVICE_TYPES);
		const browser = faker.helpers.arrayElement(BROWSERS);
		const os = faker.helpers.arrayElement(OS_NAMES);
		const path = faker.helpers.arrayElement(PATHS);
		const referrer = faker.helpers.arrayElement(REFERRERS);
		const eventName = faker.helpers.arrayElement(EVENT_NAMES);
		const customProps = generateCustomProperties(eventName);

		return {
			id: faker.string.uuid(),
			client_id: clientId,
			event_name: eventName,
			anonymous_id: anonymousId,
			time: baseTime,
			session_id: sessionId,
			timestamp: baseTime,
			session_start_time:
				baseTime - faker.number.int({ min: 0, max: 1_800_000 }),
			referrer: referrer === 'direct' ? undefined : referrer,
			url: `https://${domain}${path}`,
			path,
			title: generatePageTitle(path),
			ip: faker.internet.ip(),
			user_agent: faker.internet.userAgent(),
			browser_name: browser,
			browser_version: faker.system.semver(),
			os_name: os,
			os_version: faker.system.semver(),
			device_type: deviceType,
			device_brand:
				deviceType === 'mobile'
					? faker.helpers.arrayElement(['Apple', 'Samsung', 'Google'])
					: null,
			device_model:
				deviceType === 'mobile' ? faker.commerce.productName() : null,
			country: faker.location.countryCode(),
			region: faker.location.state(),
			city: faker.location.city(),
			screen_resolution: `${faker.helpers.arrayElement([1920, 1366, 1440, 1280, 1024])}x${faker.helpers.arrayElement([1080, 768, 900, 720, 640])}`,
			viewport_size: `${faker.number.int({ min: 800, max: 1920 })}x${faker.number.int({ min: 600, max: 1080 })}`,
			language: faker.location.language().alpha2,
			connection_type: faker.helpers.arrayElement([
				'wifi',
				'4g',
				'ethernet',
				'3g',
			]),
			rtt: faker.number.int({ min: 10, max: 500 }),
			downlink: faker.number.float({ min: 1, max: 100, fractionDigits: 1 }),
			time_on_page: faker.number.float({ min: 5, max: 600, fractionDigits: 1 }),
			scroll_depth: faker.number.float({ min: 0, max: 100, fractionDigits: 1 }),
			interaction_count: faker.number.int({ min: 0, max: 20 }),
			exit_intent: faker.datatype.boolean() ? 1 : 0,
			page_count: faker.number.int({ min: 1, max: 10 }),
			is_bounce: faker.datatype.boolean() ? 1 : 0,
			has_exit_intent: faker.datatype.boolean() ? 1 : 0,
			page_size: faker.number.int({ min: 50_000, max: 5_000_000 }),
			utm_source: faker.helpers.maybe(
				() =>
					faker.helpers.arrayElement([
						'google',
						'facebook',
						'twitter',
						'email',
					]),
				{ probability: 0.3 }
			),
			utm_medium: faker.helpers.maybe(
				() => faker.helpers.arrayElement(['cpc', 'organic', 'social', 'email']),
				{ probability: 0.3 }
			),
			utm_campaign: faker.helpers.maybe(() => faker.lorem.slug(), {
				probability: 0.2,
			}),
			load_time: faker.number.int({ min: 200, max: 5000 }),
			dom_ready_time: faker.number.int({ min: 100, max: 3000 }),
			dom_interactive: faker.number.int({ min: 50, max: 2000 }),
			ttfb: faker.number.int({ min: 50, max: 1000 }),
			connection_time: faker.number.int({ min: 10, max: 200 }),
			request_time: faker.number.int({ min: 20, max: 500 }),
			render_time: faker.number.int({ min: 50, max: 1000 }),
			redirect_time: faker.number.int({ min: 0, max: 100 }),
			domain_lookup_time: faker.number.int({ min: 5, max: 100 }),
			fcp: faker.number.int({ min: 500, max: 4000 }),
			lcp: faker.number.int({ min: 1000, max: 6000 }),
			cls: faker.number.float({ min: 0, max: 0.5, fractionDigits: 3 }),
			fid: faker.number.int({ min: 10, max: 300 }),
			inp: faker.number.int({ min: 50, max: 500 }),
			href: faker.helpers.maybe(() => faker.internet.url(), {
				probability: 0.2,
			}),
			text: faker.helpers.maybe(() => faker.lorem.words({ min: 1, max: 5 }), {
				probability: 0.2,
			}),
			value: faker.helpers.maybe(() => faker.commerce.price(), {
				probability: 0.1,
			}),
			properties: JSON.stringify(customProps),
			created_at: Date.now(),
		};
	});

	await clickHouse.insert({
		table: TABLE_NAMES.events,
		format: 'JSONEachRow',
		values: events,
	});

	console.log(`Inserted ${events.length} events for client ${clientId}`);
})();
