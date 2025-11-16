import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { createUser, getUserByUsername, updateUserWallet } from '../db'

const router = Router()

router.post('/signup', async (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: string; password?: string }
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }

  const existing = getUserByUsername(username)
  if (existing) {
    return res.status(409).json({ error: 'Account already exists' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = createUser(username, passwordHash)

  // TODO: Call Circle Wallets API to create Arc wallet here and update user.walletId
  updateUserWallet(username, null)

  res.status(201).json({ id: user.id, username: user.username, walletId: user.walletId })
})

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: string; password?: string }
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }

  const user = getUserByUsername(username)
  if (!user) {
    return res.status(404).json({ error: 'Account not found' })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  res.json({ id: user.id, username: user.username, walletId: user.walletId })
})

export const authRoutes = router
