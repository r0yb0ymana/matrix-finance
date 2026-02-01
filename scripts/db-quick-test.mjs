/**
 * Quick PostgreSQL Connection Test
 * Tests multiple connection methods
 */

import pg from 'pg';
const { Client } = pg;

async function testConnection(connectionString, description) {
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log(`✅ ${description} - SUCCESS!`);

    const result = await client.query('SELECT version()');
    console.log(`   PostgreSQL: ${result.rows[0].version.split(',')[0]}`);

    await client.end();
    return true;
  } catch (error) {
    console.log(`❌ ${description} - Failed`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 Testing PostgreSQL connections...\n');

  const tests = [
    {
      url: 'postgresql://postgres@localhost:5432/postgres',
      desc: 'No password (peer/trust auth)'
    },
    {
      url: 'postgresql://postgres:postgres@localhost:5432/postgres',
      desc: 'Password: "postgres"'
    },
    {
      url: 'postgresql://postgres:password@localhost:5432/postgres',
      desc: 'Password: "password"'
    },
    {
      url: 'postgresql://postgres:admin@localhost:5432/postgres',
      desc: 'Password: "admin"'
    }
  ];

  for (const test of tests) {
    const success = await testConnection(test.url, test.desc);
    if (success) {
      console.log(`\n🎉 Found working connection!`);
      console.log(`\nUpdate your .env.local with:`);
      console.log(`DATABASE_URL=${test.url.replace('/postgres', '/matrix_finance')}`);
      return;
    }
    console.log();
  }

  console.log('⚠️  None of the common configurations worked.\n');
  console.log('Next steps:');
  console.log('1. Check if PostgreSQL is running');
  console.log('2. Try running: node scripts/db-test.mjs (will prompt for password)');
  console.log('3. Or reset your password in psql');
}

main();
