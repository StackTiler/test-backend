/**
 * ============================================================================
 * Database Connection Interfaces
 * ============================================================================
 *
 * WORKFLOW OVERVIEW:
 * Defines TypeScript interfaces for database connection configuration.
 * Provides type-safe options for MongoDB connection management.
 *
 * USAGE:
 * Pass these interfaces to MongooseConnection singleton for database setup.
 *
 * ============================================================================
 */

import { ConnectOptions } from "mongoose";

export interface IMongooseConnectionOptions {
  uri: string;
  options?: ConnectOptions;
  serviceName?: string;
  retryDelayMs?: number;
}
