import { Router, Request, Response } from 'express'
import { submitManagedBridge, getManagedBridgeStatus, getServiceWalletAddress } from '../services/managedBridgeService'

const router = Router()

// Specific routes MUST come before wildcard routes
router.get('/service-wallet', (req, res) => {
  res.json({ address: getServiceWalletAddress() })
})

router.post('/', async (req: Request, res: Response) => {
  const { userSourceAddress, userDestAddress, amount, fromChain, toChain } = req.body

  if (!userSourceAddress || !userDestAddress || !amount || !fromChain || !toChain) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const job = await submitManagedBridge({
    userSourceAddress,
    userDestAddress,
    amount,
    fromChain,
    toChain,
  })

  res.json({ jobId: job.id, status: job.status })
})

router.get('/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params
  const job = getManagedBridgeStatus(jobId)

  if (!job) {
    return res.status(404).json({ error: 'Job not found' })
  }

  res.json(job)
})

export const managedBridgeRoutes = router
