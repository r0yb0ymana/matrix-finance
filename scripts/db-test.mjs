/**
 * Quick Database Connection Test
 */

import { config } from 'dotenv';
import pg from 'pg';
import readline from 'readline';
const { Client } = pg;

// Load environment variables
config({ path: '.env.local' });

function question(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function testConnection() {
  console.log('🔍 Testing database connection...\n');

  let databaseUrl = process.env.DATABASE_URL;

  // Check if password is in the connection string
  const urlPattern = /postgresql:\/\/([^:@]+)(:([^@]+))?@/;
  const match = databaseUrl.match(urlPattern);

  if (!match || !match[3]) {
    console.log('💡 No password found in DATABASE_URL\n');
    const password = await question('Enter PostgreSQL password (or press Enter to try without password): ');

    if (password) {
      // Insert password into connection string
      databaseUrl = databaseUrl.replace(
        /postgresql:\/\/([^@]+)@/,
        `postgresql://$1:${password}@`
      );
    }
  }

  console.log(`📡 Testing connection...\n`);

  // Try connecting to postgres database first (not matrix_finance)
  const postgresUrl = databaseUrl.replace('/matrix_finance', '/postgres');
  console.log('Attempting connection to postgres database...');

  const client = new Client({ connectionString: postgresUrl });

  try {
    await client.connect();
    console.log('✅ Connection successful!\n');

    // Check PostgreSQL version
    const versionResult = await client.query('SELECT version()');
    console.log(`📊 PostgreSQL Version: ${versionResult.rows[0].version.split(',')[0]}\n`);

    // Check if matrix_finance database exists
    console.log('🔍 Checking if matrix_finance database exists...');
    const dbResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      ['matrix_finance']
    );

    if (dbResult.rows.length > 0) {
      console.log('✅ Database "matrix_finance" already exists\n');

      // Try connecting to matrix_finance
      await client.end();
      const matrixClient = new Client({ connectionString: databaseUrl });
      await matrixClient.connect();

      // Check tables
      const tablesResult = await matrixClient.query(`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
      `);

      if (tablesResult.rows.length > 0) {
        console.log(`✅ Found ${tablesResult.rows.length} tables:`);
        tablesResult.rows.forEach(row => console.log(`   - ${row.tablename}`));
      } else {
        console.log('⚠️  Database exists but no tables found. Run: npm run db:migrate');
      }

      await matrixClient.end();
    } else {
      console.log('⚠️  Database "matrix_finance" does not exist yet\n');
      console.log('Creating database...');
      await client.query('CREATE DATABASE matrix_finance');
      console.log('✅ Database created successfully!\n');
      console.log('Next step: Run npm run db:migrate');
    }

    await client.end();
    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('\n❌ Connection failed:');
    console.error(error.message);

    if (error.code === '28P01') {
      console.log('\n💡 Authentication failed. Your PostgreSQL requires a password.');
      console.log('   Run: npm run db:setup');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 PostgreSQL is not running. Start it with:');
      console.log('   - Windows: Start PostgreSQL service');
      console.log('   - macOS: brew services start postgresql');
      console.log('   - Linux: sudo systemctl start postgresql');
    } else {
      console.log(`\n💡 Error code: ${error.code}`);
    }

    process.exit(1);
  }
}

testConnection();
