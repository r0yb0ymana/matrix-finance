/**
 * Database Connection Utility
 *
 * Provides a PostgreSQL connection pool for the Next.js application.
 * Optimized for serverless environments (Vercel, Railway).
 *
 * @module lib/db
 */

import 'server-only';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

// =====================================================
// Connection Pool Configuration
// =====================================================

let pool: Pool | null = null;

/**
 * Get or create a PostgreSQL connection pool
 * Singleton pattern to avoid creating multiple pools
 */
export function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL environment variable is not set. ' +
        'Please add it to your .env.local file.'
      );
    }

    pool = new Pool({
      connectionString: databaseUrl,

      // Connection pool settings
      min: parseInt(process.env.DATABASE_POOL_MIN || '2'),
      max: parseInt(process.env.DATABASE_POOL_MAX || '10'),

      // Idle timeout (close connections after 30 seconds of inactivity)
      idleTimeoutMillis: 30000,

      // Connection timeout (fail after 10 seconds)
      connectionTimeoutMillis: 10000,

      // SSL configuration
      ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    });

    // Log connection errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle database client', err);
    });

    // Log when pool is created
    console.log('✓ Database connection pool created');
  }

  return pool;
}

/**
 * Execute a SQL query with parameters
 *
 * @example
 * const result = await query('SELECT * FROM applications WHERE id = $1', [id]);
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  const start = Date.now();

  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;

    // Log slow queries (> 1 second)
    if (duration > 1000) {
      console.warn(`Slow query (${duration}ms):`, text.substring(0, 100));
    }

    return result;
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 *
 * @example
 * const client = await getClient();
 * try {
 *   await client.query('BEGIN');
 *   await client.query('INSERT INTO applications...');
 *   await client.query('INSERT INTO contacts...');
 *   await client.query('COMMIT');
 * } catch (error) {
 *   await client.query('ROLLBACK');
 *   throw error;
 * } finally {
 *   client.release();
 * }
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return await pool.connect();
}

/**
 * Execute a database transaction
 *
 * @example
 * await transaction(async (client) => {
 *   await client.query('INSERT INTO applications...');
 *   await client.query('INSERT INTO contacts...');
 * });
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close the database connection pool
 * Only call this when shutting down the application
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✓ Database connection pool closed');
  }
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Get a single row by ID
 */
export async function findById<T extends QueryResultRow = any>(
  table: string,
  id: string
): Promise<T | null> {
  const result = await query<T>(
    `SELECT * FROM ${table} WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Insert a row and return the created record
 */
export async function insert<T extends QueryResultRow = any>(
  table: string,
  data: Record<string, any>
): Promise<T> {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

  const result = await query<T>(
    `INSERT INTO ${table} (${keys.join(', ')})
     VALUES (${placeholders})
     RETURNING *`,
    values
  );

  return result.rows[0];
}

/**
 * Update a row by ID and return the updated record
 */
export async function update<T extends QueryResultRow = any>(
  table: string,
  id: string,
  data: Record<string, any>
): Promise<T | null> {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');

  const result = await query<T>(
    `UPDATE ${table}
     SET ${setClause}
     WHERE id = $1
     RETURNING *`,
    [id, ...values]
  );

  return result.rows[0] || null;
}

/**
 * Delete a row by ID
 */
export async function deleteById(
  table: string,
  id: string
): Promise<boolean> {
  const result = await query(
    `DELETE FROM ${table} WHERE id = $1`,
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * Check if database connection is healthy
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query('SELECT 1 as healthy');
    return result.rows[0]?.healthy === 1;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// =====================================================
// Type-Safe Query Builders (Optional)
// =====================================================

/**
 * Build WHERE clause from object
 * @internal
 */
function buildWhereClause(
  conditions: Record<string, any>,
  startIndex: number = 1
): { clause: string; values: any[] } {
  const keys = Object.keys(conditions);
  if (keys.length === 0) {
    return { clause: '', values: [] };
  }

  const values = Object.values(conditions);
  const clause = keys
    .map((key, i) => `${key} = $${startIndex + i}`)
    .join(' AND ');

  return { clause: `WHERE ${clause}`, values };
}

/**
 * Find rows matching conditions
 */
export async function findWhere<T extends QueryResultRow = any>(
  table: string,
  conditions: Record<string, any>,
  options?: {
    orderBy?: string;
    limit?: number;
    offset?: number;
  }
): Promise<T[]> {
  const { clause, values } = buildWhereClause(conditions);

  let sql = `SELECT * FROM ${table} ${clause}`;

  if (options?.orderBy) {
    sql += ` ORDER BY ${options.orderBy}`;
  }

  if (options?.limit) {
    sql += ` LIMIT ${options.limit}`;
  }

  if (options?.offset) {
    sql += ` OFFSET ${options.offset}`;
  }

  const result = await query<T>(sql, values);
  return result.rows;
}

/**
 * Count rows matching conditions
 */
export async function count(
  table: string,
  conditions?: Record<string, any>
): Promise<number> {
  if (!conditions || Object.keys(conditions).length === 0) {
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM ${table}`
    );
    return parseInt(result.rows[0]?.count || '0');
  }

  const { clause, values } = buildWhereClause(conditions);
  const result = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM ${table} ${clause}`,
    values
  );
  return parseInt(result.rows[0]?.count || '0');
}

// =====================================================
// Exports
// =====================================================

export default {
  getPool,
  query,
  getClient,
  transaction,
  closePool,
  findById,
  insert,
  update,
  deleteById,
  findWhere,
  count,
  healthCheck,
};
