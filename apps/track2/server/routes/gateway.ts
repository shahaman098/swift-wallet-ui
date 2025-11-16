import { Router, Request, Response } from 'express'
import { GatewayClient, GatewayBalanceRequest } from '../services/gatewayClient'

const router = Router()
const gatewayClient = new GatewayClient()

router.get('/info', async (_req: Request, res: Response) => {
  try {
    const info = await gatewayClient.info()
    res.json(info)
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : 'Gateway info failed' })
  }
})

router.post('/balances', async (req: Request, res: Response) => {
  const body = req.body as GatewayBalanceRequest
  if (!body?.token || !Array.isArray(body.sources) || body.sources.length === 0) {
    return res.status(400).json({ error: 'token and sources are required' })
  }

  try {
    const balances = await gatewayClient.balances(body)
    res.json(balances)
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : 'Gateway balances failed' })
  }
})

router.post('/transfer', (_req: Request, res: Response) => {
  // TODO: Implement burn intent creation, signature, transfer submission, and mint call.
  res.status(501).json({ error: 'Gateway transfer not implemented yet' })
})

export const gatewayRoutes = router
