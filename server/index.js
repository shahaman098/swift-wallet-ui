// Load environment variables from .env file
import 'dotenv/config';

import { createApp } from './app.js';
import { DatabaseStore } from './db-store.js';
import { closeDatabase, getDatabase, initializeSchema } from './database.js';

const port = Number(process.env.PORT) || 3000;

let server = null;

async function startServer() {
  try {
    // Initialize local database (no configuration needed)
    console.log('Initializing local database...');
    const db = getDatabase();
    
    // Initialize schema
    console.log('Initializing database schema...');
    await initializeSchema();
    console.log('✅ Database ready');

    // Check Circle API configuration
    console.log('Checking Circle API configuration...');
    const circleApiKey = process.env.CIRCLE_API_KEY;
    if (!circleApiKey) {
      console.warn('⚠️  CIRCLE_API_KEY not set - Circle features will not work');
      console.warn('   To enable Circle Wallets and CCTP:');
      console.warn('   1. Get an API key from https://console.circle.com/');
      console.warn('   2. Create a .env file in the project root');
      console.warn('   3. Add: CIRCLE_API_KEY=your_api_key_here');
    } else {
      console.log('✅ Circle API key found');
      try {
        const { checkCircleConnection } = await import('./circle.js');
        await checkCircleConnection();
      } catch (error) {
        console.error('❌ Circle API connection failed:', error.message);
        console.error('   Please verify your CIRCLE_API_KEY is valid');
      }
    }

    // Initialize store
    const store = new DatabaseStore();
    server = createApp(store);

    server.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`✅ Swift Wallet backend listening on port ${port}`);
      // eslint-disable-next-line no-console
      console.log(`✅ Using local SQLite database (no configuration needed)`);
      // eslint-disable-next-line no-console
      console.log(`\n🚀 Server is ready! Frontend should be accessible now.`);
    });

    server.on('error', (error) => {
      // eslint-disable-next-line no-console
      console.error('Server error:', error);
      if (error.code === 'EADDRINUSE') {
        // eslint-disable-next-line no-console
        console.error(`Port ${port} is already in use. Please stop the other server or use a different port.`);
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('\n❌ Failed to start server:', error.message);
    // eslint-disable-next-line no-console
    console.error('\n💡 The server uses a local SQLite database that should work automatically.');
    // eslint-disable-next-line no-console
    console.error('   If you see this error, please check the error message above.');
    // eslint-disable-next-line no-console
    console.error('\n');
    process.exit(1);
  }
}

startServer();

function shutdown() {
  if (server) {
    server.close(() => {
      closeDatabase();
      process.exit(0);
    });
  } else {
    closeDatabase();
    process.exit(0);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
