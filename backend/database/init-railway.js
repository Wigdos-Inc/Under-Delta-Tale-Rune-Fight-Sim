require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeRailwayDatabase() {
  let connection;
  try {
    console.log('Connecting to Railway database...');
    
    // Connect to Railway database
    connection = await mysql.createConnection({
      host: 'yamabiko.proxy.rlwy.net',
      port: 42579,
      user: process.env.RAILWAY_DB_USER || 'root',
      password: process.env.RAILWAY_DB_PASSWORD,
      database: process.env.RAILWAY_DB_NAME || 'railway',
      connectTimeout: 30000
    });

    console.log('✅ Connected to Railway database');

    // Read schema SQL file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Remove comments and split into individual statements
    const cleanSchema = schema
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');
    
    const statements = cleanSchema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`Executing ${statements.length} SQL statements...`);
    if (statements.length === 0) {
      console.error('No SQL statements found in schema.sql');
      process.exit(1);
    }

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`[${i + 1}/${statements.length}] Executing...`);
      await connection.query(statement);
    }

    console.log('✅ Database initialized successfully!');
    console.log('\nCreated tables:');
    console.log('  - users');
    console.log('  - enemy_defeats');
    console.log('  - personal_bests');
    console.log('  - user_stats');

    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    if (err.code) console.error('Error code:', err.code);
    if (connection) await connection.end();
    process.exit(1);
  }
}

initializeRailwayDatabase();
