#!/usr/bin/env node
/**
 * ClickHouse Tables Initialization Command
 * 
 * This command initializes all ClickHouse tables required for the analytics system.
 * 
 * Usage:
 * bun run src/commands/init-tables.ts
 */

import initClickhouseTables from '../scripts/init-clickhouse-tables';
import { createLogger } from '@databuddy/logger';

const logger = createLogger('init-tables-command');

async function run() {
  logger.info('Initializing ClickHouse tables...');
  
  try {
    const result = await initClickhouseTables();
    
    if (result.success) {
      logger.info(result.message);
      process.exit(0);
    } else {
      logger.error(result.message);
      process.exit(1);
    }
  } catch (error) {
    logger.error('Unhandled error during initialization:', error);
    process.exit(1);
  }
}

run(); 