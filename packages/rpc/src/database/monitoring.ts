import { Client } from 'pg';

export interface DatabaseStats {
	// Database info
	databaseName: string;
	databaseSize: string;

	// Connection info
	maxConnections: number;
	activeConnections: number;

	// Activity stats
	totalQueries: number;
	totalInserts: number;
	totalUpdates: number;
	totalDeletes: number;

	// Performance metrics
	hitRatio: number; // Cache hit ratio percentage
	indexUsage: number; // Index usage percentage
}

export interface TableStats {
	tableName: string;
	schemaName: string;
	rowCount: number;
	totalSize: string;
	indexSize: string;
	lastVacuum?: string;
	lastAnalyze?: string;
}

/**
 * Get basic database statistics using a readonly connection
 */
export async function getDatabaseStats(
	connectionUrl: string
): Promise<DatabaseStats> {
	const client = new Client({
		connectionString: connectionUrl,
		connectionTimeoutMillis: 10_000,
		query_timeout: 30_000,
	});

	try {
		await client.connect();

		// Get database basic info
		const dbInfoResult = await client.query(`
			SELECT 
				current_database() as database_name,
				pg_size_pretty(pg_database_size(current_database())) as database_size
		`);

		// Get connection stats
		const connectionResult = await client.query(`
			SELECT 
				setting as max_connections
			FROM pg_settings 
			WHERE name = 'max_connections'
		`);

		const activeConnectionsResult = await client.query(`
			SELECT count(*) as active_connections
			FROM pg_stat_activity
			WHERE state = 'active'
		`);

		// Get database activity stats
		const activityResult = await client.query(`
			SELECT 
				SUM(xact_commit + xact_rollback) as total_queries,
				SUM(tup_inserted) as total_inserts,
				SUM(tup_updated) as total_updates,
				SUM(tup_deleted) as total_deletes
			FROM pg_stat_database
			WHERE datname = current_database()
		`);

		// Get cache hit ratio
		const hitRatioResult = await client.query(`
			SELECT 
				ROUND(
					100.0 * SUM(blks_hit) / NULLIF(SUM(blks_hit + blks_read), 0), 
					2
				) as hit_ratio
			FROM pg_stat_database
			WHERE datname = current_database()
		`);

		// Get index usage ratio
		const indexUsageResult = await client.query(`
			SELECT 
				ROUND(
					100.0 * SUM(idx_scan) / NULLIF(SUM(seq_scan + idx_scan), 0), 
					2
				) as index_usage
			FROM pg_stat_user_tables
		`);

		const dbInfo = dbInfoResult.rows[0];
		const connectionInfo = connectionResult.rows[0];
		const activeConnections = activeConnectionsResult.rows[0];
		const activity = activityResult.rows[0];
		const hitRatio = hitRatioResult.rows[0];
		const indexUsage = indexUsageResult.rows[0];

		return {
			databaseName: dbInfo.database_name,
			databaseSize: dbInfo.database_size,
			maxConnections: Number.parseInt(connectionInfo.max_connections, 10),
			activeConnections: Number.parseInt(
				activeConnections.active_connections,
				10
			),
			totalQueries: Number.parseInt(activity.total_queries || '0', 10),
			totalInserts: Number.parseInt(activity.total_inserts || '0', 10),
			totalUpdates: Number.parseInt(activity.total_updates || '0', 10),
			totalDeletes: Number.parseInt(activity.total_deletes || '0', 10),
			hitRatio: Number.parseFloat(hitRatio.hit_ratio || '0'),
			indexUsage: Number.parseFloat(indexUsage.index_usage || '0'),
		};
	} finally {
		await client.end();
	}
}

/**
 * Get table statistics using a readonly connection
 */
export async function getTableStats(
	connectionUrl: string,
	limit = 20
): Promise<TableStats[]> {
	const client = new Client({
		connectionString: connectionUrl,
		connectionTimeoutMillis: 10_000,
		query_timeout: 30_000,
	});

	try {
		await client.connect();

		const result = await client.query(
			`
			SELECT 
				schemaname as schema_name,
				tablename as table_name,
				n_tup_ins + n_tup_upd + n_tup_del as row_count,
				pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
				pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
				last_vacuum,
				last_analyze
			FROM pg_stat_user_tables 
			ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
			LIMIT $1
		`,
			[limit]
		);

		return result.rows.map((row) => ({
			tableName: row.table_name,
			schemaName: row.schema_name,
			rowCount: Number.parseInt(row.row_count || '0', 10),
			totalSize: row.total_size,
			indexSize: row.index_size,
			lastVacuum: row.last_vacuum
				? new Date(row.last_vacuum).toISOString()
				: undefined,
			lastAnalyze: row.last_analyze
				? new Date(row.last_analyze).toISOString()
				: undefined,
		}));
	} finally {
		await client.end();
	}
}
