import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import { circleRoutes } from './routes/circle'
import { authRoutes } from './routes/auth'
import { gatewayRoutes } from './routes/gateway'
import { managedBridgeRoutes } from './routes/managedBridge'

dotenv.config()

const app = express()
app.use(express.json())

app.use((req, res, next) => {
  const start = Date.now()
  const originalSend = res.send.bind(res)
  const originalJson = res.json.bind(res)
  let responsePayload: unknown

  res.send = (body?: unknown) => {
    responsePayload = body
    return originalSend(body as Parameters<typeof originalSend>[0])
  }

  res.json = (body?: unknown) => {
    responsePayload = body
    return originalJson(body as Parameters<typeof originalJson>[0])
  }

  res.on('finish', () => {
    const durationMs = Date.now() - start
    const headerSnapshot = JSON.stringify(req.headers, null, 2)
    const querySnapshot = Object.keys(req.query || {}).length > 0 ? JSON.stringify(req.query, null, 2) : ''
    let bodySnapshot: string
    if (req.body === undefined) {
      bodySnapshot = 'undefined'
    } else if (typeof req.body === 'string') {
      bodySnapshot = req.body
    } else {
      try {
        bodySnapshot = JSON.stringify(req.body, null, 2)
      } catch {
        bodySnapshot = '[unserializable body]'
      }
    }

    let responseSnapshot = ''
    if (responsePayload !== undefined) {
      if (typeof responsePayload === 'string') {
        responseSnapshot = responsePayload
      } else {
        try {
          responseSnapshot = JSON.stringify(responsePayload, null, 2)
        } catch {
          responseSnapshot = '[unserializable response]'
        }
      }
    }

    console.log('[http]', {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs,
      headers: headerSnapshot,
      query: querySnapshot,
      body: bodySnapshot,
      response: responseSnapshot,
    })
  })

  next()
})

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/circle', circleRoutes)
app.use('/api/gateway', gatewayRoutes)
app.use('/api/managed-bridge', managedBridgeRoutes)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`)
})
