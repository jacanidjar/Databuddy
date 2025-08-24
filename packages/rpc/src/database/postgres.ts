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

export interface CreateUserResult {
	connectionUrl: string;
	username: string;
	password: string;
}

export type PermissionLevel = 'readonly' | 'admin';

/**
 * Parse PostgreSQL connection URL into components
 */
export function parsePostgresUrl(url: string): PostgresConnectionInfo {
	try {
		const urlObj = new URL(url);
		return {
			host: urlObj.hostname,
			port: urlObj.port ? Number.parseInt(urlObj.port, 10) : 5432,
			database: urlObj.pathname.slice(1),
			username: urlObj.username,
			password: urlObj.password,
			ssl: urlObj.searchParams.get('sslmode') === 'require',
		};
	} catch (error) {
		throw new Error(`Invalid PostgreSQL URL: ${error.message}`);
	}
}

/**
 * Build PostgreSQL connection URL from components
 */
export function buildPostgresUrl(info: PostgresConnectionInfo): string {
	const url = new URL('postgresql://');
	url.hostname = info.host;
	url.port = info.port.toString();
	url.username = info.username;
	url.password = info.password;
	url.pathname = `/${info.database}`;

	if (info.ssl) {
		url.searchParams.set('sslmode', 'require');
	}

	return url.toString();
}

/**
 * Test database connection
 */
export async function testConnection(url: string): Promise<void> {
	const client = new Client({
		connectionString: url,
		connectionTimeoutMillis: 10_000,
		query_timeout: 5000,
	});

	try {
		await client.connect();
		await client.query('SELECT 1');
	} catch (error) {
		throw new Error(`Failed to connect: ${error.message}`);
	} finally {
		await client.end();
	}
}

/**
 * Create a database user with specified permission level
 */
export async function createUser(
	adminUrl: string,
	permissionLevel: PermissionLevel = 'readonly'
): Promise<CreateUserResult> {
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

	const userPrefix = permissionLevel === 'admin' ? 'admin' : 'readonly';
	const username = `databuddy_${userPrefix}_${nanoid(8)
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '')}`;
	const password = nanoid(32).replace(/[^a-zA-Z0-9]/g, '');

	try {
		await client.connect();

		const privilegeCheck = await client.query(
			`
			SELECT 
				rolsuper as usesuper,
				rolcreatedb as usecreatedb,
				rolcreaterole as usecreaterole
			FROM pg_roles 
			WHERE rolname = $1
		`,
			[connectionInfo.username]
		);

		if (privilegeCheck.rows.length === 0) {
			throw new Error('Unable to verify user privileges');
		}

		const userPrivs = privilegeCheck.rows[0];

		// Check required privileges based on permission level
		if (permissionLevel === 'admin') {
			if (
				!(
					userPrivs.usesuper ||
					(userPrivs.usecreatedb && userPrivs.usecreaterole)
				)
			) {
				throw new Error(
					'Insufficient privileges to create admin user. User must have SUPERUSER or both CREATEDB and CREATEROLE privileges.'
				);
			}
		} else if (!(userPrivs.usesuper || userPrivs.usecreatedb)) {
			throw new Error(
				'Insufficient privileges to create user. User must have SUPERUSER or CREATEDB privileges.'
			);
		}

		// Create user with appropriate base privileges
		let createUserQuery = `CREATE USER "${username}" WITH PASSWORD '${password.replace(/'/g, "''")}'`;

		if (permissionLevel === 'admin') {
			createUserQuery +=
				' CREATEDB CREATEROLE INHERIT LOGIN CONNECTION LIMIT 5';
		} else {
			createUserQuery += ' CONNECTION LIMIT 5';
		}

		await client.query(createUserQuery);

		// Grant database connection privileges
		await client.query(`
			GRANT CONNECT ON DATABASE "${connectionInfo.database}" TO "${username}"
		`);

		if (permissionLevel === 'admin') {
			// Grant comprehensive admin privileges
			await client.query(`
				GRANT ALL PRIVILEGES ON SCHEMA public TO "${username}"
			`);

			await client.query(`
				GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "${username}"
			`);

			await client.query(`
				ALTER DEFAULT PRIVILEGES IN SCHEMA public 
				GRANT ALL ON TABLES TO "${username}"
			`);

			await client.query(`
				GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "${username}"
			`);

			await client.query(`
				ALTER DEFAULT PRIVILEGES IN SCHEMA public 
				GRANT ALL ON SEQUENCES TO "${username}"
			`);

			await client.query(`
				GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO "${username}"
			`);

			await client.query(`
				ALTER DEFAULT PRIVILEGES IN SCHEMA public 
				GRANT ALL ON FUNCTIONS TO "${username}"
			`);

			// Grant system catalog privileges for monitoring and extensions
			await client.query(`
				GRANT SELECT ON ALL TABLES IN SCHEMA information_schema TO "${username}"
			`);

			await client.query(`
				GRANT SELECT ON ALL TABLES IN SCHEMA pg_catalog TO "${username}"
			`);

			// Allow extension management (requires SUPERUSER or specific grants)
			if (userPrivs.usesuper) {
				await client.query(`
					ALTER USER "${username}" WITH SUPERUSER
				`);
			} else {
				// Grant specific privileges for extension management
				await client.query(`
					GRANT "${connectionInfo.username}" TO "${username}"
				`);
			}
		} else {
			// Grant readonly privileges
			await client.query(`
				GRANT USAGE ON SCHEMA public TO "${username}"
			`);

			await client.query(`
				GRANT SELECT ON ALL TABLES IN SCHEMA public TO "${username}"
			`);

			await client.query(`
				ALTER DEFAULT PRIVILEGES IN SCHEMA public 
				GRANT SELECT ON TABLES TO "${username}"
			`);

			await client.query(`
				GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO "${username}"
			`);

			await client.query(`
				ALTER DEFAULT PRIVILEGES IN SCHEMA public 
				GRANT USAGE ON SEQUENCES TO "${username}"
			`);

			// Grant monitoring privileges
			await client.query(`
				GRANT SELECT ON pg_stat_database TO "${username}"
			`);

			await client.query(`
				GRANT SELECT ON pg_stat_user_tables TO "${username}"
			`);

			await client.query(`
				GRANT SELECT ON pg_stat_user_indexes TO "${username}"
			`);
		}

		const newConnectionInfo: PostgresConnectionInfo = {
			...connectionInfo,
			username,
			password,
		};

		const connectionUrl = buildPostgresUrl(newConnectionInfo);

		// Test the new connection
		await testConnection(connectionUrl);

		return {
			connectionUrl,
			username,
			password,
		};
	} catch (error) {
		try {
			await client.query(`DROP USER IF EXISTS "${username}"`);
		} catch {
			// Ignore errors
		}

		throw new Error(
			`Failed to create ${permissionLevel} user: ${error.message}`
		);
	} finally {
		await client.end();
	}
}

/**
 * Create a readonly user for monitoring purposes (backward compatibility)
 * @deprecated Use createUser with permissionLevel='readonly' instead
 */
export async function createReadonlyUser(
	adminUrl: string
): Promise<CreateUserResult> {
	const result = await createUser(adminUrl, 'readonly');
	return {
		connectionUrl: result.connectionUrl,
		username: result.username,
		password: result.password,
	};
}

/**
 * Create an admin user with full database privileges (backward compatibility)
 * @deprecated Use createUser with permissionLevel='admin' instead
 */
export async function createAdminUser(
	adminUrl: string
): Promise<CreateUserResult> {
	const result = await createUser(adminUrl, 'admin');
	return {
		connectionUrl: result.connectionUrl,
		username: result.username,
		password: result.password,
	};
}

/**
 * Delete a database user
 */
export async function deleteUser(
	adminUrl: string,
	username: string
): Promise<void> {
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

	try {
		await client.connect();
		await client.query(`DROP USER IF EXISTS "${username}"`);
	} catch (error) {
		throw new Error(`Failed to delete user ${username}: ${error.message}`);
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
