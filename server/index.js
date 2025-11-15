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
