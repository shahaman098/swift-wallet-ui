import { ensureSchema, db, dbPath } from '../db'

console.log(`[db] initializing schema at ${dbPath}`)
ensureSchema()
console.log('[db] schema ready')

db.close()
