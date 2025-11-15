// Test database connection script
import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  
  // Check environment variables
  const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  const missing = required.filter(key => !process.env[key] || process.env[key].includes('your-'));
  
  if (missing.length > 0) {
    console.error('❌ Missing or invalid environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n📝 Please update your .env file with real database credentials.');
    console.error('💡 See SETUP_DATABASE.md for instructions.');
    process.exit(1);
  }
  
  console.log('✅ Environment variables found');
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   Port: ${process.env.DB_PORT || 5432}`);
  console.log(`   Database: ${process.env.DB_NAME}`);
  console.log(`   User: ${process.env.DB_USER}\n`);
  
  // Test connection
  const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
  };
  
  const pool = new Pool(config);
  
  try {
    console.log('🔄 Attempting to connect...');
    const result = await Promise.race([
      pool.query('SELECT NOW() as current_time, version() as pg_version'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 10000)
      )
    ]);
    
    console.log('✅ Connection successful!');
    console.log(`   Server time: ${result.rows[0].current_time}`);
    console.log(`   PostgreSQL version: ${result.rows[0].pg_version.split(' ')[0]} ${result.rows[0].pg_version.split(' ')[1]}`);
    console.log('\n🎉 Database is ready! You can now start the server with: npm run server');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error(`   Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Possible issues:');
      console.error('   - Database server is not running');
      console.error('   - Wrong host or port');
      console.error('   - Firewall blocking connection');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Possible issues:');
      console.error('   - Invalid hostname');
      console.error('   - DNS resolution failed');
    } else if (error.message.includes('password')) {
      console.error('\n💡 Possible issues:');
      console.error('   - Wrong password');
      console.error('   - User does not exist');
    } else if (error.message.includes('database')) {
      console.error('\n💡 Possible issues:');
      console.error('   - Database does not exist');
      console.error('   - User does not have access');
    }
    
    await pool.end();
    process.exit(1);
  }
}

testConnection();

