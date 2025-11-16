import { generateEntitySecret, registerEntitySecretCiphertext } from '@circle-fin/developer-controlled-wallets'
import fs from 'node:fs'
import dotenv from 'dotenv'

dotenv.config()

const logs: string[] = []
const originalLog = console.log
console.log = (...args: unknown[]) => {
  logs.push(args.join(' '))
  originalLog(...args)
}

generateEntitySecret()

console.log = originalLog
const entitySecret = logs.find((line) => /[0-9a-f]{64}/i.test(line))?.match(/[0-9a-f]{64}/i)?.[0]
if (!entitySecret) {
  throw new Error('Failed to capture entity secret output')
}

const response = await registerEntitySecretCiphertext({
  apiKey: process.env.CIRCLE_API_KEY!,
  entitySecret,
  recoveryFileDownloadPath: '.',
})

fs.writeFileSync('./circle-entity-secret-recovery.json', response.data?.recoveryFile ?? '')
console.log('\n✅ Ciphertext registered. Recovery file written to circle-entity-secret-recovery.json')
console.log('📝 Entity secret (store securely):', entitySecret)
console.log('\n🔑 Add this to your .env file:')
console.log(`CIRCLE_ENTITY_SECRET="${entitySecret}"`)
