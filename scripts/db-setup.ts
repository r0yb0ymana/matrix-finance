/**
 * Interactive Database Setup Script
 *
 * Helps set up PostgreSQL database with proper credentials
 *
 * Usage: npm run db:setup
 */

import { config } from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import pkg from 'pg';
const { Client } = pkg;
import * as readline from 'readline';

// Load environment variables
config({ path: '.env.local' });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupDatabase() {
  console.log('\n🚀 Matrix Finance - Database Setup\n');
  console.log('This script will help you set up PostgreSQL for the application.\n');

  // Get PostgreSQL credentials
  console.log('📝 PostgreSQL Connection Details:\n');

  const host = await question('Host (default: localhost): ') || 'localhost';
  const port = await question('Port (default: 5432): ') || '5432';
  const user = await question('Username (default: postgres): ') || 'postgres';
  const password = await question('Password: ');
  const dbName = await question('Database name (default: matrix_finance): ') || 'matrix_finance';

  console.log('\n📡 Testing connection...');

  // Test connection to PostgreSQL (not the specific database yet)
  const postgresUrl = `postgresql://${user}:${password}@${host}:${port}/postgres`;

  try {
    const client = new Client({ connectionString: postgresUrl });
    await client.connect();
    console.log('✅ Connection successful!\n');

    // Check if database exists
    console.log(`🔍 Checking if database "${dbName}" exists...`);
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rows.length === 0) {
      console.log(`📦 Creating database "${dbName}"...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log('✅ Database created successfully!\n');
    } else {
      console.log('✅ Database already exists\n');
    }

    await client.end();

    // Update .env.local
    console.log('💾 Updating .env.local file...');
    const databaseUrl = `postgresql://${user}:${password}@${host}:${port}/${dbName}`;

    const envPath = join(process.cwd(), '.env.local');
    let envContent = readFileSync(envPath, 'utf-8');

    // Replace DATABASE_URL line
    envContent = envContent.replace(
      /DATABASE_URL=.*/,
      `DATABASE_URL=${databaseUrl}`
    );

    writeFileSync(envPath, envContent);
    console.log('✅ .env.local updated\n');

    // Run migration
    console.log('🔨 Running database migration...\n');

    const migrationClient = new Client({ connectionString: databaseUrl });
    await migrationClient.connect();

    const schemaPath = join(process.cwd(), 'database', 'schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf-8');

    await migrationClient.query(schemaSql);
    console.log('✅ Database schema created successfully!\n');

    // Verify tables
    const tablesResult = await migrationClient.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    console.log(`✅ Created ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach((row) => {
      console.log(`   - ${row.tablename}`);
    });
    console.log();

    // Check seed data
    const rateBandsResult = await migrationClient.query('SELECT COUNT(*) FROM rate_bands');
    console.log(`✅ Seeded ${rateBandsResult.rows[0].count} rate bands`);

    const loanTermsResult = await migrationClient.query('SELECT COUNT(*) FROM loan_terms');
    console.log(`✅ Seeded ${loanTermsResult.rows[0].count} loan terms`);

    await migrationClient.end();

    console.log('\n🎉 Database setup complete!');
    console.log('\n✨ You can now run: npm run dev\n');

  } catch (error) {
    console.error('\n❌ Setup failed:');
    if (error instanceof Error) {
      console.error(error.message);

      if ('code' in error) {
        if (error.code === '28P01') {
          console.log('\n💡 Authentication failed. Please check your username and password.');
        } else if (error.code === 'ECONNREFUSED') {
          console.log('\n💡 PostgreSQL is not running or not accessible on this host/port.');
        } else {
          console.log(`\nError code: ${error.code}`);
        }
      }
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run setup
setupDatabase();
