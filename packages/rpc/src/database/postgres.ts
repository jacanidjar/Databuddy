import { nanoid } from 'nanoid';
import { Client } from 'pg';

export interface PostgresConnectionInfo {
	host: string;
	port: number;
	database: string;
	username: string;
	password: string;
	ssl?: boolean;
}

export interface ReadonlyUserResult {
	readonlyUrl: string;
	username: string;
	password: string;
}

/**
 * Parse PostgreSQL connection URL into components
 */
export function parsePostgresUrl(url: string): PostgresConnectionInfo {
	try {
		const parsed = new URL(url);

		if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') {
			throw new Error('Invalid PostgreSQL URL protocol');
		}

		return {
			host: parsed.hostname,
			port: Number.parseInt(parsed.port || '5432', 10),
			database: parsed.pathname.slice(1) || 'postgres',
			username: parsed.username,
			password: parsed.password,
			ssl: parsed.searchParams.get('sslmode') === 'require',
		};
	} catch (error) {
		throw new Error(`Failed to parse PostgreSQL URL: ${error.message}`);
	}
}

/**
 * Build PostgreSQL connection URL from components
 */
export function buildPostgresUrl(info: PostgresConnectionInfo): string {
	const url = new URL(
		`postgresql://${info.username}:${info.password}@${info.host}:${info.port}/${info.database}`
	);

	if (info.ssl) {
		url.searchParams.set('sslmode', 'require');
	}

	return url.toString();
}

/**
 * Test database connection
 */
export async function testConnection(url: string): Promise<void> {
	const connectionInfo = parsePostgresUrl(url);
	const client = new Client({
		host: connectionInfo.host,
		port: connectionInfo.port,
		database: connectionInfo.database,
		user: connectionInfo.username,
		password: connectionInfo.password,
		ssl: connectionInfo.ssl ? { rejectUnauthorized: false } : false,
		connectionTimeoutMillis: 30_000,
		query_timeout: 10_000,
	});

	try {
		await client.connect();
		await client.query('SELECT 1');
	} catch (error) {
		if (error.code === 'ENOTFOUND') {
			throw new Error(`Cannot resolve hostname: ${connectionInfo.host}`);
		}
		if (error.code === 'ECONNREFUSED') {
			throw new Error(
				`Connection refused to ${connectionInfo.host}:${connectionInfo.port}`
			);
		}
		if (error.code === 'ETIMEDOUT') {
			throw new Error(
				`Connection timeout to ${connectionInfo.host}:${connectionInfo.port}`
			);
		}
		if (error.code === '28P01') {
			throw new Error('Invalid username or password');
		}
		if (error.code === '3D000') {
			throw new Error(`Database "${connectionInfo.database}" does not exist`);
		}
		if (error.message?.includes('timeout expired')) {
			throw new Error(
				`Connection timeout - check if database is accessible at ${connectionInfo.host}:${connectionInfo.port}`
			);
		}
		throw error;
	} finally {
		await client.end();
	}
}

/**
 * Create a readonly user for monitoring purposes
 */
export async function createReadonlyUser(
	adminUrl: string
): Promise<ReadonlyUserResult> {
	const connectionInfo = parsePostgresUrl(adminUrl);
	const client = new Client({
		host: connectionInfo.host,
		port: connectionInfo.port,
		database: connectionInfo.database,
		user: connectionInfo.username,
		password: connectionInfo.password,
		ssl: connectionInfo.ssl ? { rejectUnauthorized: false } : false,
		connectionTimeoutMillis: 30_000,
		query_timeout: 30_000,
	});

	const readonlyUsername = `databuddy_readonly_${nanoid(8)
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '')}`;
	const readonlyPassword = nanoid(32).replace(/[^a-zA-Z0-9]/g, '');

	try {
		await client.connect();

		const privilegeCheck = await client.query(
			`
			SELECT 
				usesuper, 
				usecreatedb
			FROM pg_user 
			WHERE usename = $1
		`,
			[connectionInfo.username]
		);

		if (privilegeCheck.rows.length === 0) {
			throw new Error('Unable to verify user privileges');
		}

		const userPrivs = privilegeCheck.rows[0];
		if (!(userPrivs.usesuper || userPrivs.usecreatedb)) {
			throw new Error(
				'Insufficient privileges to create readonly user. User must have SUPERUSER or CREATEDB privileges.'
			);
		}

		await client.query(
			`CREATE USER "${readonlyUsername}" WITH PASSWORD '${readonlyPassword.replace(/'/g, "''")}' CONNECTION LIMIT 5`
		);

		await client.query(`
			GRANT CONNECT ON DATABASE "${connectionInfo.database}" TO "${readonlyUsername}"
		`);

		await client.query(`
			GRANT USAGE ON SCHEMA public TO "${readonlyUsername}"
		`);

		await client.query(`
			GRANT SELECT ON ALL TABLES IN SCHEMA public TO "${readonlyUsername}"
		`);

		await client.query(`
			ALTER DEFAULT PRIVILEGES IN SCHEMA public 
			GRANT SELECT ON TABLES TO "${readonlyUsername}"
		`);

		await client.query(`
			GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO "${readonlyUsername}"
		`);

		await client.query(`
			ALTER DEFAULT PRIVILEGES IN SCHEMA public 
			GRANT USAGE ON SEQUENCES TO "${readonlyUsername}"
		`);

		await client.query(`
			GRANT SELECT ON pg_stat_database TO "${readonlyUsername}"
		`);

		await client.query(`
			GRANT SELECT ON pg_stat_user_tables TO "${readonlyUsername}"
		`);

		await client.query(`
			GRANT SELECT ON pg_stat_user_indexes TO "${readonlyUsername}"
		`);

		const readonlyConnectionInfo: PostgresConnectionInfo = {
			...connectionInfo,
			username: readonlyUsername,
			password: readonlyPassword,
		};

		const readonlyUrl = buildPostgresUrl(readonlyConnectionInfo);

		await testConnection(readonlyUrl);

		return {
			readonlyUrl,
			username: readonlyUsername,
			password: readonlyPassword,
		};
	} catch (error) {
		try {
			await client.query(`DROP USER IF EXISTS "${readonlyUsername}"`);
		} catch {}

		throw new Error(`Failed to create readonly user: ${error.message}`);
	} finally {
		await client.end();
	}
}

/**
 * Validate that a connection is readonly
 */
export async function validateReadonlyAccess(url: string): Promise<boolean> {
	const client = new Client({
		connectionString: url,
		connectionTimeoutMillis: 10_000,
		query_timeout: 5000,
	});

	try {
		await client.connect();

		try {
			await client.query('CREATE TEMP TABLE readonly_test (id INTEGER)');
			await client.query('DROP TABLE readonly_test');
			return false;
		} catch {
			return true;
		}
	} catch (error) {
		throw new Error(`Failed to validate readonly access: ${error.message}`);
	} finally {
		await client.end();
	}
}
