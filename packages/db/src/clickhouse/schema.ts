import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { clickHouse } from './client';

// Get the directory path for SQL files
const SQL_DIR = join(__dirname, 'sql');

// Helper function to read SQL files
function readSqlFile(filename: string): string {
	return readFileSync(join(SQL_DIR, filename), 'utf-8');
}

// Load SQL DDL statements from files
const CREATE_DATABASE = readSqlFile('database.sql');
const CREATE_EVENTS_TABLE = readSqlFile('events.sql');
const CREATE_ERRORS_TABLE = readSqlFile('errors.sql');
const CREATE_WEB_VITALS_TABLE = readSqlFile('web-vitals.sql');
const CREATE_STRIPE_PAYMENT_INTENTS_TABLE = readSqlFile(
	'stripe-payment-intents.sql'
);
const CREATE_STRIPE_CHARGES_TABLE = readSqlFile('stripe-charges.sql');
const CREATE_STRIPE_REFUNDS_TABLE = readSqlFile('stripe-refunds.sql');
const CREATE_BLOCKED_TRAFFIC_TABLE = readSqlFile('blocked-traffic.sql');
const CREATE_EMAIL_EVENTS_TABLE = readSqlFile('email-events.sql');

export interface ErrorEvent {
	id: string;
	client_id: string;
	event_id?: string;
	anonymous_id: string;
	session_id: string;
	timestamp: number;
	path: string;
	message: string;
	filename?: string;
	lineno?: number;
	colno?: number;
	stack?: string;
	error_type?: string;
	ip?: string;
	user_agent?: string;
	browser_name?: string;
	browser_version?: string;
	os_name?: string;
	os_version?: string;
	device_type?: string;
	country?: string;
	region?: string;
	created_at: number;
}

export interface WebVitalsEvent {
	id: string;
	client_id: string;
	event_id?: string;
	anonymous_id: string;
	session_id: string;
	timestamp: number;
	path: string;
	fcp?: number;
	lcp?: number;
	cls?: number;
	fid?: number;
	inp?: number;
	ip?: string;
	user_agent?: string;
	browser_name?: string;
	browser_version?: string;
	os_name?: string;
	os_version?: string;
	device_type?: string;
	country?: string;
	region?: string;
	created_at: number;
}

// Stripe table interfaces
export interface StripePaymentIntent {
	id: string;
	client_id: string;
	webhook_token: string;
	created: number;
	status: string;
	currency: string;
	amount: number;
	amount_received: number;
	amount_capturable: number;
	livemode: number;
	metadata: Record<string, unknown>;
	payment_method_types: string[];
	failure_reason?: string;
	canceled_at?: number;
	cancellation_reason?: string;
	description?: string;
	application_fee_amount?: number;
	setup_future_usage?: string;
	session_id?: string;
}

export interface StripeCharge {
	id: string;
	client_id: string;
	webhook_token: string;
	created: number;
	status: string;
	currency: string;
	amount: number;
	amount_captured: number;
	amount_refunded: number;
	paid: number;
	refunded: number;
	livemode: number;
	failure_code?: string;
	failure_message?: string;
	outcome_type?: string;
	risk_level?: string;
	card_brand?: string;
	payment_intent_id?: string;
	session_id?: string;
}

export interface StripeRefund {
	id: string;
	client_id: string;
	webhook_token: string;
	created: number;
	amount: number;
	status: string;
	reason?: string;
	currency: string;
	charge_id: string;
	payment_intent_id?: string;
	metadata: Record<string, unknown>;
	session_id?: string;
}

export interface BlockedTraffic {
	id: string;
	client_id?: string;
	timestamp: number;
	path?: string;
	url?: string;
	referrer?: string;
	method: string;
	origin?: string;
	ip: string;
	user_agent?: string;
	accept_header?: string;
	language?: string;
	block_reason: string;
	block_category: string;
	bot_name?: string;
	country?: string;
	region?: string;
	city?: string;
	browser_name?: string;
	browser_version?: string;
	os_name?: string;
	os_version?: string;
	device_type?: string;
	payload_size?: number;
	created_at: number;
}

export interface EmailEvent {
	event_id: string;
	email_hash: string;
	domain: string;
	labels: string[];
	event_time: number;
	received_at: number;
	ingestion_time: number;
	metadata_json: Record<string, unknown>;
}

// TypeScript interface that matches the ClickHouse schema
export interface AnalyticsEvent {
	// Core identification
	id: string;
	client_id: string;
	event_name: string;
	anonymous_id: string;
	time: number;
	session_id: string;

	// New fields
	event_type?: 'track' | 'error' | 'web_vitals';
	event_id?: string;
	session_start_time?: number;
	timestamp?: number;

	// Page context
	referrer?: string;
	url: string;
	path: string;
	title?: string;

	// Server enrichment
	ip: string;
	user_agent: string;
	browser_name?: string;
	browser_version?: string;
	os_name?: string;
	os_version?: string;
	device_type?: string;
	device_brand?: string;
	device_model?: string;
	country?: string;
	region?: string;
	city?: string;

	// User context
	screen_resolution?: string;
	viewport_size?: string;
	language?: string;
	timezone?: string;

	// Connection info
	connection_type?: string;
	rtt?: number;
	downlink?: number;

	// Engagement metrics
	time_on_page?: number;
	scroll_depth?: number;
	interaction_count?: number;
	exit_intent: number;
	page_count: number;
	is_bounce: number;
	has_exit_intent?: number;
	page_size?: number;

	// UTM parameters
	utm_source?: string;
	utm_medium?: string;
	utm_campaign?: string;
	utm_term?: string;
	utm_content?: string;

	// Performance metrics
	load_time?: number;
	dom_ready_time?: number;
	dom_interactive?: number;
	ttfb?: number;
	connection_time?: number;
	request_time?: number;
	render_time?: number;
	redirect_time?: number;
	domain_lookup_time?: number;

	// Web Vitals
	fcp?: number;
	lcp?: number;
	cls?: number;
	fid?: number;
	inp?: number;

	// Link tracking
	href?: string;
	text?: string;

	// Custom event value
	value?: string;

	// Error tracking
	error_message?: string;
	error_filename?: string;
	error_lineno?: number;
	error_colno?: number;
	error_stack?: string;
	error_type?: string;

	// Legacy properties
	properties: string;

	// Metadata
	created_at: number;
}

/**
 * Initialize the ClickHouse schema by creating necessary database and tables
 */
export async function initClickHouseSchema() {
	try {
		console.info('Initializing ClickHouse schema...');

		// Create the analytics database
		await clickHouse.command({
			query: CREATE_DATABASE,
		});
		console.info('Created database: analytics');

		// Create tables
		const tables = [
			{ name: 'events', query: CREATE_EVENTS_TABLE },
			{ name: 'errors', query: CREATE_ERRORS_TABLE },
			{ name: 'web_vitals', query: CREATE_WEB_VITALS_TABLE },
			{
				name: 'stripe_payment_intents',
				query: CREATE_STRIPE_PAYMENT_INTENTS_TABLE,
			},
			{ name: 'stripe_charges', query: CREATE_STRIPE_CHARGES_TABLE },
			{ name: 'stripe_refunds', query: CREATE_STRIPE_REFUNDS_TABLE },
			{ name: 'blocked_traffic', query: CREATE_BLOCKED_TRAFFIC_TABLE },
			{ name: 'email_events', query: CREATE_EMAIL_EVENTS_TABLE },
		];

		await Promise.all(
			tables.map(async (table) => {
				await clickHouse.command({
					query: table.query,
				});
				console.info(`Created table: analytics.${table.name}`);
			})
		);

		console.info('ClickHouse schema initialization completed successfully');
		return {
			success: true,
			message: 'ClickHouse schema initialized successfully',
			details: {
				database: 'analytics',
				tables: tables.map((t) => t.name),
			},
		};
	} catch (error) {
		console.error('Error initializing ClickHouse schema:', error);
		return {
			success: false,
			message: 'Failed to initialize ClickHouse schema',
			error: error instanceof Error ? error.message : String(error),
		};
	}
}
