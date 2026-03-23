import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import tls from 'tls'

import foodRouter from './routes/food'
import menuRouter from './routes/menu'
import ordersRouter from './routes/orders'
import uploadRouter from './routes/upload'
import settingsRouter from './routes/settings'

import adminAuthRouter from './routes/admin/auth'
import adminCategoriesRouter from './routes/admin/categories'
import adminDeliveryRouter from './routes/admin/delivery'
import adminFoodItemsRouter from './routes/admin/food-items'
import adminMenuRouter from './routes/admin/menu'
import adminSettingsRouter from './routes/admin/settings'
import adminStatsRouter from './routes/admin/stats'
import { connectToDatabase } from './lib/db'

// Load env from `backend/.env.local` first (repo-wide ignored by `.gitignore`),
// then fallback to `backend/.env`.
const envLocal = dotenv.config({ path: '.env.local' })
if (envLocal.error) {
  dotenv.config()
}

// Windows/Node TLS negotiation sometimes fails with Atlas SRV connections.
// For stability in this environment, force TLS 1.2 for all outgoing TLS sockets.
tls.DEFAULT_MIN_VERSION = 'TLSv1.2'
tls.DEFAULT_MAX_VERSION = 'TLSv1.2'

const app = express()

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
)
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())

app.get('/health', (_req, res) => res.json({ ok: true }))

// Public API
app.use('/api/food', foodRouter)
app.use('/api/menu', menuRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/settings', settingsRouter)

// Admin API
app.use('/api/admin/auth', adminAuthRouter)
app.use('/api/admin/categories', adminCategoriesRouter)
app.use('/api/admin/delivery', adminDeliveryRouter)
app.use('/api/admin/food-items', adminFoodItemsRouter)
app.use('/api/admin/menu', adminMenuRouter)
app.use('/api/admin/settings', adminSettingsRouter)
app.use('/api/admin/stats', adminStatsRouter)

const port = Number(process.env.PORT || 5000)
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`)
})

// Log DB connectivity once at startup.
// (Requests will still use the cached connection; this is just for your confirmation.)
connectToDatabase()
  .then(({ db }) => {
    // eslint-disable-next-line no-console
    console.log(`MongoDB connected: ${db.databaseName}`)
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('MongoDB not connected:', err?.message || err)
  })

