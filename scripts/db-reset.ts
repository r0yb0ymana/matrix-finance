/**
 * Database Reset Script
 *
 * Drops all tables and re-runs migration (USE WITH CAUTION!)
 *
 * Usage: npm run db:reset
 */

import { config } from 'dotenv';
import pkg from 'pg';
const { Client } = pkg;

// Load environment variables
config({ path: '.env.local' });

async function resetDatabase() {
  console.log('⚠️  WARNING: This will delete ALL data from the database!\n');

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set\n');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    console.log('📡 Connecting to database...');
    await client.connect();
    console.log('✅ Connected\n');

    console.log('🗑️  Dropping all tables...');

    // Drop all tables in reverse order (to handle foreign key constraints)
    const dropTablesSQL = `
      DROP TABLE IF EXISTS crm_sync_log CASCADE;
      DROP TABLE IF EXISTS esign_requests CASCADE;
      DROP TABLE IF EXISTS documents CASCADE;
      DROP TABLE IF EXISTS financial_positions CASCADE;
      DROP TABLE IF EXISTS addresses CASCADE;
      DROP TABLE IF EXISTS contacts CASCADE;
      DROP TABLE IF EXISTS sessions CASCADE;
      DROP TABLE IF EXISTS applications CASCADE;
      DROP TABLE IF EXISTS loan_terms CASCADE;
      DROP TABLE IF EXISTS rate_bands CASCADE;

      -- Drop types
      DROP TYPE IF EXISTS entity_type CASCADE;
      DROP TYPE IF EXISTS application_status CASCADE;
      DROP TYPE IF EXISTS finance_product CASCADE;
      DROP TYPE IF EXISTS contact_role CASCADE;
      DROP TYPE IF EXISTS address_type CASCADE;
      DROP TYPE IF EXISTS document_type CASCADE;
      DROP TYPE IF EXISTS esign_status CASCADE;
      DROP TYPE IF EXISTS sync_status CASCADE;
    `;

    await client.query(dropTablesSQL);
    console.log('✅ All tables dropped\n');

    console.log('📊 Database reset complete');
    console.log('Run "npm run db:migrate" to recreate the schema\n');

  } catch (error) {
    console.error('\n❌ Reset failed:');
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run reset
resetDatabase();
