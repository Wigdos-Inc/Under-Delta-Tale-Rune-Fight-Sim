const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 20000, // 20 seconds
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection with retry logic
async function testConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log('✅ Database connected successfully');
      connection.release();
      return;
    } catch (err) {
      console.error(`❌ Database connection attempt ${i + 1}/${retries} failed:`, err.message);
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
