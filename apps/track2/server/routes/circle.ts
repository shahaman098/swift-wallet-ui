import { Router, Request, Response } from 'express'

const router = Router()

// GET /api/circle/mock-wallets
router.get('/mock-wallets', (_req: Request, res: Response) => {
  res.json({
    wallets: [
      { chain: 'ARC-MAIN', address: '0xarc...cafe', balance: 240.35 },
      { chain: 'MATIC-AMOY', address: '0xamo...beef', balance: 62.1 },
    ],
  })
})

// POST /api/circle/cctp-transfer
router.post('/cctp-transfer', (_req: Request, res: Response) => {
  // TODO: Call Circle CCTP APIs to burn on source chain, fetch attestation, mint on Arc
  res.json({ status: 'mock-submitted', message: 'CCTP transfer flow not implemented yet.' })
})

// POST /api/circle/payment-intent
router.post('/payment-intent', (_req: Request, res: Response) => {
  // TODO: Invoke Circle Gateway to create payment intents and settle on Arc
  res.json({ status: 'mock-created', message: 'Gateway payment flow not implemented yet.' })
})

export const circleRoutes = router
