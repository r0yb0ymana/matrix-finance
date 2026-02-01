/**
 * Database Status Script
 *
 * Shows database connection status and table information
 *
 * Usage: npm run db:status
 */

import { config } from 'dotenv';
import pkg from 'pg';
const { Client } = pkg;

// Load environment variables
config({ path: '.env.local' });

async function checkDatabaseStatus() {
  console.log('🔍 Checking database status...\n');

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set\n');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    console.log('📡 Connecting to database...');
    await client.connect();
    console.log('✅ Connection successful\n');

    // Get database version
    const versionResult = await client.query('SELECT version()');
    console.log('📊 PostgreSQL Version:');
    console.log(`   ${versionResult.rows[0].version.split(',')[0]}\n`);

    // Get tables
    const tablesResult = await client.query(`
      SELECT
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    if (tablesResult.rows.length === 0) {
      console.log('⚠️  No tables found. Run "npm run db:migrate" to create schema\n');
    } else {
      console.log(`📋 Tables (${tablesResult.rows.length}):`);
      tablesResult.rows.forEach((row) => {
        console.log(`   - ${row.tablename.padEnd(30)} ${row.size}`);
      });
      console.log();

      // Get row counts for key tables
      console.log('📊 Data Summary:');
      const tables = ['applications', 'contacts', 'rate_bands', 'loan_terms', 'documents', 'esign_requests'];

      for (const table of tables) {
        try {
          const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
          console.log(`   - ${table.padEnd(25)} ${countResult.rows[0].count} rows`);
        } catch {
          // Table doesn't exist
        }
      }
      console.log();
    }

    console.log('✅ Database is healthy\n');

  } catch (error) {
    console.error('\n❌ Database check failed:');
    if (error instanceof Error) {
      console.error(error.message);
      if ('code' in error && error.code === 'ECONNREFUSED') {
        console.log('\n💡 PostgreSQL may not be running. Start it with:');
        console.log('   - macOS: brew services start postgresql');
        console.log('   - Linux: sudo systemctl start postgresql');
        console.log('   - Windows: pg_ctl start\n');
      }
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run status check
checkDatabaseStatus();
