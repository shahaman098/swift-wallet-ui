import { generateEntitySecret, registerEntitySecretCiphertext } from '@circle-fin/developer-controlled-wallets';
import fs from 'node:fs';
import dotenv from 'dotenv';

dotenv.config();

(async () => {
  const logs: string[] = [];
  const originalLog = console.log;

  console.log = (...args: unknown[]) => {
    logs.push(args.join(' '));
    originalLog(...args);
  };

  await generateEntitySecret();

  console.log = originalLog;

  const entitySecret = logs
    .flatMap((line) => line.match(/[0-9a-f]{64}/gi) ?? [])
    .find(Boolean);

  if (!entitySecret) {
    throw new Error('Failed to capture entity secret output.');
  }

  if (!process.env.CIRCLE_API_KEY) {
    throw new Error('CIRCLE_API_KEY is not set in your environment.');
  }

  const response = await registerEntitySecretCiphertext({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret,
    recoveryFileDownloadPath: '.',
  });

  const recoveryFile = response.data?.recoveryFile ?? '';
  if (!recoveryFile) {
    throw new Error('Circle did not return a recovery file.');
  }

  fs.writeFileSync('./circle-entity-secret-recovery.json', recoveryFile);

  console.log('\n✅ Ciphertext registered. Recovery file written to circle-entity-secret-recovery.json');
  console.log('📝 Entity secret (store securely):', entitySecret);
  console.log('\n🔑 Add this to your .env file:');
  console.log();
})();
