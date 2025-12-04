const mysql = require('mysql2/promise');
const { URL } = require('url');

function getDbConfigFromEnv() {
  // If Railway provides a templated MYSQL_URL (or MYSQL_PUBLIC_URL), prefer it
  const urlVar = process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL || process.env.MYSQLURI || process.env.DATABASE_URL;
  if (urlVar) {
    try {
      const parsed = new URL(urlVar);
      return {
        host: parsed.hostname,
        port: parsed.port || 3306,
        user: parsed.username,
        password: parsed.password,
        database: parsed.pathname ? parsed.pathname.replace(/^\//, '') : undefined
      };
    } catch (e) {
      console.warn('Invalid URL in MYSQL_URL (ignored):', e.message);
    }
  }

  // Fallback to individual environment variables (support multiple naming variants)
  return {
    host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
    port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
    user: process.env.DB_USER || process.env.MYSQLUSER,
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
    database: process.env.DB_NAME || process.env.MYSQLDATABASE
  };
}

const cfg = getDbConfigFromEnv();

// Diagnostic: print resolved DB connection info (never print the password)
console.log('DB config resolved:', {
  host: cfg.host,
  port: cfg.port,
  user: cfg.user,
  database: cfg.database
});

const pool = mysql.createPool({
  host: cfg.host,
  port: cfg.port,
  user: cfg.user,
  password: cfg.password,
  database: cfg.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 20000, // 20 seconds
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection with retry logic and full error logging
async function testConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log('✅ Database connected successfully');
      connection.release();
      return;
    } catch (err) {
      console.error(`❌ Database connection attempt ${i + 1}/${retries} failed:`);
      // Log stack if available for better diagnostics
      if (err && err.stack) console.error(err.stack);
      else if (err && err.message) console.error(err.message);
      else console.error(String(err));

      if (i < retries - 1) {
        console.log('Retrying in 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  console.error('⚠️  Database connection failed after all retries. Server will continue but database features may not work.');
}

testConnection();

module.exports = pool;
