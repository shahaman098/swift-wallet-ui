import { createApp } from './app.js';
import { DataStore } from './store.js';

const port = Number(process.env.PORT) || 3000;
const store = new DataStore();
const server = createApp(store);

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Swift Wallet backend listening on port ${port}`);
});

function shutdown() {
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
