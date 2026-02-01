/**
 * Complete Database Setup
 *
 * Usage: node scripts/db-complete-setup.mjs <password>
 * Example: node scripts/db-complete-setup.mjs mypassword123
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import pg from 'pg';
const { Client } = pg;

const password = process.argv[2];

if (!password) {
  console.log('❌ Please provide your PostgreSQL password as an argument\n');
  console.log('Usage: node scripts/db-complete-setup.mjs <password>\n');
  console.log('Example: node scripts/db-complete-setup.mjs mypassword123\n');
  process.exit(1);
}

async function completeSetup() {
  console.log('🚀 Matrix Finance - Complete Database Setup\n');

  const host = 'localhost';
  const port = '5432';
  const user = 'postgres';
  const dbName = 'matrix_finance';

  // Step 1: Test connection to PostgreSQL
  console.log('📡 Step 1: Testing connection to PostgreSQL...');
  const postgresUrl = `postgresql://${user}:${password}@${host}:${port}/postgres`;

  let client = new Client({ connectionString: postgresUrl });

  try {
    await client.connect();
    console.log('✅ Connection successful!\n');

    // Get version
    const versionResult = await client.query('SELECT version()');
    console.log(`📊 PostgreSQL: ${versionResult.rows[0].version.split(',')[0]}\n`);

    // Step 2: Check if database exists
    console.log(`🔍 Step 2: Checking if database "${dbName}" exists...`);
    const dbResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (dbResult.rows.length === 0) {
      console.log(`📦 Creating database "${dbName}"...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log('✅ Database created!\n');
    } else {
      console.log('✅ Database already exists\n');
    }

    await client.end();

    // Step 3: Update .env.local
    console.log('💾 Step 3: Updating .env.local...');
    const databaseUrl = `postgresql://${user}:${password}@${host}:${port}/${dbName}`;
    const envPath = join(process.cwd(), '.env.local');
    let envContent = readFileSync(envPath, 'utf-8');

    envContent = envContent.replace(
      /DATABASE_URL=.*/,
      `DATABASE_URL=${databaseUrl}`
    );

    writeFileSync(envPath, envContent);
    console.log('✅ .env.local updated\n');

    // Step 4: Run migration
    console.log('🔨 Step 4: Running database migration...');
    client = new Client({ connectionString: databaseUrl });
    await client.connect();

    const schemaPath = join(process.cwd(), 'database', 'schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf-8');

    await client.query(schemaSql);
    console.log('✅ Schema created!\n');

    // Step 5: Verify tables
    console.log('🔍 Step 5: Verifying tables...');
    const tablesResult = await client.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    console.log(`✅ Created ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.tablename}`);
    });
    console.log();

    // Step 6: Check seed data
    console.log('📊 Step 6: Checking seed data...');
    const rateBandsResult = await client.query('SELECT COUNT(*) FROM rate_bands');
    console.log(`✅ Seeded ${rateBandsResult.rows[0].count} rate bands`);

    const loanTermsResult = await client.query('SELECT COUNT(*) FROM loan_terms');
    console.log(`✅ Seeded ${loanTermsResult.rows[0].count} loan terms\n`);

    await client.end();

    // Success!
    console.log('🎉 Database setup complete!\n');
    console.log('✨ You can now run: npm run dev\n');

  } catch (error) {
    console.error('\n❌ Setup failed:');
    console.error(error.message);

    if (error.code === '28P01') {
      console.log('\n💡 Authentication failed. The password is incorrect.');
      console.log('   Please check your PostgreSQL password and try again.\n');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 PostgreSQL is not running.');
      console.log('   Start PostgreSQL and try again.\n');
    } else {
      console.log(`\n💡 Error code: ${error.code}\n`);
    }

    process.exit(1);
  }
}

completeSetup();
