#!/usr/bin/env node
/**
 * Events Table Schema Migration Script
 * 
 * This script runs the migration to update the analytics.events table schema
 * to add new columns for the enhanced analytics data.
 * 
 * Usage:
 * bun run src/commands/run-events-migration.ts
 */

import migrateEventsSchema from '../scripts/migrate-events-schema';
import { createLogger } from '@databuddy/logger';

const logger = createLogger('migration-runner');

async function run() {
  logger.info('Starting events table schema migration...');
  
  try {
    const result = await migrateEventsSchema();
    
    if (result.success) {
      logger.info(result.message);
      process.exit(0);
    } else {
      logger.error(result.message);
      process.exit(1);
    }
  } catch (error) {
    logger.error('Unhandled error during migration:', error);
    process.exit(1);
  }
}

run(); 