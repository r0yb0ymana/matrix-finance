/**
 * Database Migration Script
 *
 * Runs the database schema SQL file to create all tables and seed data
 *
 * Usage: npm run db:migrate
 */

import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import pkg from 'pg';
const { Client } = pkg;

// Load environment variables
config({ path: '.env.local' });

async function runMigration() {
  console.log('🔄 Starting database migration...\n');

  // Read DATABASE_URL from environment
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set');
    console.log('Please create a .env.local file with your database connection string');
    console.log('Example: DATABASE_URL=postgresql://postgres:password@localhost:5432/matrix_finance\n');
    process.exit(1);
  }

  // Connect to database
  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    console.log('📡 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully\n');

    // Read schema SQL file
    console.log('📄 Reading schema file...');
    const schemaPath = join(process.cwd(), 'database', 'schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf-8');
    console.log('✅ Schema file loaded\n');

    // Execute schema
    console.log('🔨 Creating database schema...');
    await client.query(schemaSql);
    console.log('✅ Database schema created successfully\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const result = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    console.log(`✅ Created ${result.rows.length} tables:`);
    result.rows.forEach((row) => {
      console.log(`   - ${row.tablename}`);
    });
    console.log();

    // Check rate bands
    const rateBandsResult = await client.query('SELECT COUNT(*) FROM rate_bands');
    console.log(`✅ Seeded ${rateBandsResult.rows[0].count} rate bands`);

    const loanTermsResult = await client.query('SELECT COUNT(*) FROM loan_terms');
    console.log(`✅ Seeded ${loanTermsResult.rows[0].count} loan terms`);

    console.log('\n🎉 Migration completed successfully!');

  } catch (error) {
    console.error('\n❌ Migration failed:');
    if (error instanceof Error) {
      console.error(error.message);
      if ('code' in error) {
        console.error('Error code:', error.code);
      }
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run migration
runMigration();
