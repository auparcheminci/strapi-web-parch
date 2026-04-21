'use strict';

const { Client } = require('pg');

function getConnectionConfig() {
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL };
  }

  return {
    host: process.env.PGHOST || '127.0.0.1',
    port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
    database: process.env.PGDATABASE || 'postgres',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
  };
}

async function main() {
  const client = new Client(getConnectionConfig());

  try {
    await client.connect();
    const result = await client.query('SELECT NOW() AS now, version() AS version');
    const row = result.rows[0];

    console.log('✅ PostgreSQL connection successful.');
    console.log(`Server time: ${row.now}`);
    console.log(`Server version: ${row.version}`);
  } catch (error) {
    console.error('❌ PostgreSQL connection failed.');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

main();
