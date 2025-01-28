import { ConnectionPool, config as SQLConfig } from 'mssql';
import type { DatabaseConfig } from '../types/index.js';

export async function createConnectionPool(config: DatabaseConfig): Promise<ConnectionPool> {
  const sqlConfig: SQLConfig = {
    server: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    options: {
      encrypt: config.encrypt,
      trustServerCertificate: config.trustServerCertificate,
      enableArithAbort: config.enableArithAbort,
      rowCollectionOnRequestCompletion: true,
    },
    pool: {
      max: config.pool.max,
      min: config.pool.min,
      idleTimeoutMillis: config.pool.idleTimeoutMillis,
      acquireTimeoutMillis: config.pool.acquireTimeoutMillis,
    },
    requestTimeout: config.queryTimeout,
    arrayRowMode: config.rowsAsArray,
    stream: false,
  };

  const pool = new ConnectionPool(sqlConfig);

  try {
    await pool.connect();
    return pool;
  } catch (error) {
    // Ensure pool is closed if connection fails
    await pool.close();
    throw error;
  }
}

export async function testConnection(pool: ConnectionPool): Promise<void> {
  try {
    await pool.request().query('SELECT 1');
  } catch (error) {
    throw new Error(`Failed to connect to database: ${(error as Error).message}`);
  }
}
