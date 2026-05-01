const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set!');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL connected');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err.message);
});

const verifyConnection = async (retries = 5, delay = 3000) => {
  for (let i = 1; i <= retries; i++) {
    try {
      const client = await pool.connect();
      client.release();
      console.log('✅ Database connection verified');
      return;
    } catch (err) {
      console.warn(`⚠️ DB attempt ${i}/${retries} failed: ${err.message}`);
      if (i < retries) await new Promise(r => setTimeout(r, delay));
    }
  }
  console.error('❌ Could not connect to database after all retries');
};

verifyConnection();

const shutdown = async () => {
  try {
    await pool.end();
    console.log('✅ PostgreSQL pool has ended');
  } catch (error) {
    console.error('Error shutting down PostgreSQL pool:', error);
  }
};

module.exports = { pool, shutdown };