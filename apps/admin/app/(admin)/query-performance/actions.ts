'use server';

import { chQuery } from '@databuddy/db';
import type { QueryPerformanceMetrics, QueryPerformanceSummary, QueryPerformanceFilters } from '@/types/query-performance';

/**
 * Get query performance summary statistics
 */
export async function getQueryPerformanceSummary(timeRangeHours = 24, durationThresholdMs = 1000) {
  try {
    const query = `
      SELECT 
        count() as total_queries,
        countIf(query_duration_ms >= ${durationThresholdMs}) as slow_queries_count,
        avg(query_duration_ms) as avg_duration_ms,
        avg(memory_usage / 1024 / 1024) as avg_memory_mb,
        sum(read_rows) as total_rows_read,
        sum(read_bytes) as total_bytes_read,
        0 as cache_hit_ratio
      FROM system.query_log 
      WHERE event_time >= now() - INTERVAL ${timeRangeHours} HOUR
        AND type = 'QueryFinish'
        AND query NOT LIKE '%system.query_log%'
    `;

    const results = await chQuery<{
      total_queries: number;
      slow_queries_count: number;
      avg_duration_ms: number;
      avg_memory_mb: number;
      total_rows_read: number;
      total_bytes_read: number;
      cache_hit_ratio: number;
    }>(query);

    const summary: QueryPerformanceSummary = results[0] || {
      total_queries: 0,
      slow_queries_count: 0,
      avg_duration_ms: 0,
      avg_memory_mb: 0,
      total_rows_read: 0,
      total_bytes_read: 0,
      cache_hit_ratio: 0,
    };

    return { summary, error: null };
  } catch (error) {
    console.error('Error fetching query performance summary:', error);
    return {
      summary: null,
      error: `Failed to fetch query performance summary. ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Get detailed query performance metrics for slow queries
 */
export async function getSlowQueries(filters: QueryPerformanceFilters = {}) {
  const {
    time_range_hours = 24,
    query_type = '',
    database = '',
  } = filters;

  try {
    let whereClause = `
      WHERE event_time >= now() - INTERVAL ${time_range_hours} HOUR
        AND type = 'QueryFinish'
    `;

    if (query_type) {
      whereClause += ` AND query_kind = '${query_type}'`;
    }

    if (database) {
      whereClause += ` AND has(databases, '${database}')`;
    }

    const query = `
      SELECT 
        query_id,
        query,
        query_duration_ms,
        read_rows,
        read_bytes,
        result_rows,
        memory_usage,
        memory_usage as peak_memory_usage,
        event_time,
        toUnixTimestamp(event_time) * 1000000 as query_start_time_microseconds,
        type,
        tables,
        databases,
        exception,
        user,
        toString(sipHash64(query)) as normalized_query_hash,
        'Unknown' as query_kind,
        0 as written_rows,
        0 as written_bytes,
        0 as http_method,
        '' as http_user_agent,
        0 as filesystem_cache_read_bytes,
        0 as filesystem_cache_write_bytes
      FROM system.query_log 
      ${whereClause}
      ORDER BY query_duration_ms DESC
      LIMIT 100
    `;

    const results = await chQuery<QueryPerformanceMetrics>(query);

    return { queries: results, error: null };
  } catch (error) {
    console.error('Error fetching slow queries:', error);
    return {
      queries: [],
      error: `Failed to fetch slow queries. ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Get query performance breakdown by database
 */
export async function getQueryPerformanceByDatabase(timeRangeHours = 24) {
  try {
    const query = `
      SELECT 
        arrayJoin(databases) as database,
        count() as query_count,
        avg(query_duration_ms) as avg_duration_ms,
        max(query_duration_ms) as max_duration_ms,
        sum(read_rows) as total_rows_read,
        sum(read_bytes) as total_bytes_read,
        avg(memory_usage / 1024 / 1024) as avg_memory_mb,
        countIf(query_duration_ms > 1000) as slow_queries_count,
        countIf(query_duration_ms > 5000) as very_slow_queries_count,
        countIf(query_duration_ms > 10000) as critical_queries_count,
        countIf(exception_code != 0) as error_count,
        any(user) as most_active_user,
        any(query) as slowest_query_sample
      FROM system.query_log 
      WHERE event_time >= now() - INTERVAL ${timeRangeHours} HOUR
        AND type = 'QueryFinish'
        AND length(databases) > 0
      GROUP BY database
      ORDER BY avg_duration_ms DESC
      LIMIT 20
    `;

    const results = await chQuery<{
      database: string;
      query_count: number;
      avg_duration_ms: number;
      max_duration_ms: number;
      total_rows_read: number;
      total_bytes_read: number;
      avg_memory_mb: number;
      slow_queries_count: number;
      very_slow_queries_count: number;
      critical_queries_count: number;
      error_count: number;
      most_active_user: string;
      slowest_query_sample: string;
    }>(query);

    return { databases: results, error: null };
  } catch (error) {
    console.error('Error fetching query performance by database:', error);
    return {
      databases: [],
      error: `Failed to fetch database performance. ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Get most frequent slow queries (grouped by normalized query hash)
 */
export async function getMostFrequentSlowQueries(timeRangeHours = 24, durationThresholdMs = 1000) {
  try {
    const query = `
      SELECT 
        toString(sipHash64(query)) as normalized_query_hash,
        any(query) as sample_query,
        count() as frequency,
        avg(query_duration_ms) as avg_duration_ms,
        max(query_duration_ms) as max_duration_ms,
        avg(read_rows) as avg_rows_read,
        avg(memory_usage / 1024 / 1024) as avg_memory_mb,
        any(databases) as databases,
        any(tables) as tables
      FROM system.query_log 
      WHERE event_time >= now() - INTERVAL ${timeRangeHours} HOUR
        AND type = 'QueryFinish'
      GROUP BY toString(sipHash64(query))
      ORDER BY frequency DESC, avg_duration_ms DESC
      LIMIT 20
    `;

    const results = await chQuery<{
      normalized_query_hash: string;
      sample_query: string;
      frequency: number;
      avg_duration_ms: number;
      max_duration_ms: number;
      avg_rows_read: number;
      avg_memory_mb: number;
      databases: string[];
      tables: string[];
    }>(query);

    return { frequentQueries: results, error: null };
  } catch (error) {
    console.error('Error fetching frequent slow queries:', error);
    return {
      frequentQueries: [],
      error: `Failed to fetch frequent slow queries. ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Get system tables information with size and row counts
 */
export async function getSystemTables() {
  try {
    const query = `
      SELECT 
        database,
        table,
        engine,
        total_rows,
        total_bytes,
        formatReadableSize(total_bytes) as readable_size,
        partition_key,
        sorting_key,
        primary_key,
        comment
      FROM system.tables 
      WHERE database = 'system'
      ORDER BY total_bytes DESC
    `;

    const results = await chQuery<{
      database: string;
      table: string;
      engine: string;
      total_rows: number;
      total_bytes: number;
      readable_size: string;
      partition_key: string;
      sorting_key: string;
      primary_key: string;
      comment: string;
    }>(query);

    return { tables: results, error: null };
  } catch (error) {
    console.error('Error fetching system tables:', error);
    return {
      tables: [],
      error: `Failed to fetch system tables. ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Export table data to CSV
 */
export async function exportTableData(tableName: string, limit = 10000) {
  try {
    const query = `
      SELECT *
      FROM system.${tableName}
      LIMIT ${limit}
    `;

    const results = await chQuery(query);

    // Convert to CSV format
    if (results.length === 0) {
      return { csvData: '', error: 'No data to export' };
    }

    const headers = Object.keys(results[0]);
    const csvRows = [
      headers.join(','),
      ...results.map(row =>
        headers.map(header => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          const escaped = String(value).replace(/"/g, '""');
          return escaped.includes(',') ? `"${escaped}"` : escaped;
        }).join(',')
      )
    ];

    const csvData = csvRows.join('\n');

    return { csvData, error: null };
  } catch (error) {
    console.error('Error exporting table data:', error);
    return {
      csvData: '',
      error: `Failed to export table data. ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Truncate a system table
 */
export async function truncateTable(tableName: string) {
  try {
    // Only allow truncating specific system tables for safety
    const allowedTables = [
      'query_log',
      'query_thread_log',
      'trace_log',
      'metric_log',
      'asynchronous_metric_log',
      'part_log',
      'text_log',
      'crash_log'
    ];

    if (!allowedTables.includes(tableName)) {
      return { success: false, error: `Table ${tableName} is not allowed to be truncated` };
    }

    const query = `TRUNCATE TABLE system.${tableName}`;
    await chQuery(query);

    return { success: true, error: null };
  } catch (error) {
    console.error('Error truncating table:', error);
    return {
      success: false,
      error: `Failed to truncate table. ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Get table storage details
 */
export async function getTableStorageDetails(tableName: string) {
  try {
    const query = `
      SELECT 
        database,
        table,
        engine,
        partition_key,
        sorting_key,
        primary_key,
        total_rows,
        total_bytes,
        formatReadableSize(total_bytes) as readable_size,
        comment
      FROM system.tables 
      WHERE database = 'system' AND table = '${tableName}'
    `;

    const results = await chQuery(query);
    return { details: results[0] || null, error: null };
  } catch (error) {
    console.error('Error fetching table storage details:', error);
    return {
      details: null,
      error: `Failed to fetch table storage details. ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Get ClickHouse disk storage info
 */
export async function getClickhouseDisks() {
  try {
    const query = `
      SELECT
        name,
        path,
        free_space,
        total_space,
        keep_free_space,
        (total_space - free_space) AS used_space,
        formatReadableSize(free_space) AS free_space_formatted,
        formatReadableSize(total_space) AS total_space_formatted,
        formatReadableSize(keep_free_space) AS keep_free_space_formatted,
        formatReadableSize(total_space - free_space) AS used_space_formatted
      FROM system.disks
    `;
    const results = await chQuery<{
      name: string;
      path: string;
      free_space: number;
      total_space: number;
      keep_free_space: number;
      used_space: number;
      free_space_formatted: string;
      total_space_formatted: string;
      keep_free_space_formatted: string;
      used_space_formatted: string;
    }>(query);
    // Map to only return formatted values for UI
    return {
      disks: results.map(disk => ({
        name: disk.name,
        path: disk.path,
        free_space: disk.free_space_formatted,
        total_space: disk.total_space_formatted,
        keep_free_space: disk.keep_free_space_formatted,
        used_space: disk.used_space_formatted,
      })),
      error: null
    };
  } catch (error) {
    console.error('Error fetching ClickHouse disk info:', error);
    return { disks: [], error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Get actual database tables (non-system tables)
 */
export async function getActualDatabaseTables() {
  try {
    const query = `
      SELECT 
        database,
        table,
        engine,
        total_rows,
        total_bytes,
        formatReadableSize(total_bytes) as readable_size,
        partition_key,
        sorting_key,
        primary_key,
        comment
      FROM system.tables 
      WHERE database != 'system'
      ORDER BY total_bytes DESC
    `;

    const results = await chQuery<{
      database: string;
      table: string;
      engine: string;
      total_rows: number;
      total_bytes: number;
      readable_size: string;
      partition_key: string;
      sorting_key: string;
      primary_key: string;
      comment: string;
    }>(query);

    return { tables: results, error: null };
  } catch (error) {
    console.error('Error fetching actual database tables:', error);
    return {
      tables: [],
      error: `Failed to fetch actual database tables. ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Get memory-intensive queries
 */
export async function getMemoryIntensiveQueries(timeRangeHours = 24) {
  try {
    const query = `
      SELECT 
        query_id,
        query,
        query_duration_ms,
        read_rows,
        read_bytes,
        result_rows,
        memory_usage,
        event_time,
        toUnixTimestamp(event_time) * 1000000 as query_start_time_microseconds,
        type,
        tables,
        databases,
        exception,
        user,
        toString(sipHash64(query)) as normalized_query_hash,
        'Unknown' as query_kind,
        0 as written_rows,
        0 as written_bytes,
        0 as http_method,
        '' as http_user_agent,
        0 as filesystem_cache_read_bytes,
        0 as filesystem_cache_write_bytes
      FROM system.query_log 
      WHERE event_time >= now() - INTERVAL ${timeRangeHours} HOUR
        AND type = 'QueryFinish'
        AND memory_usage > 0
      ORDER BY memory_usage DESC
      LIMIT 100
    `;

    const results = await chQuery(query);

    return { queries: results, error: null };
  } catch (error) {
    console.error('Error fetching memory-intensive queries:', error);
    return {
      queries: [],
      error: `Failed to fetch memory-intensive queries. ${error instanceof Error ? error.message : String(error)}`,
    };
  }
} 