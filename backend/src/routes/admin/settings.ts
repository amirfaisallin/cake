import { Router } from 'express'
import { connectToDatabase } from '../../lib/db'
import { fallbackGetSettings, fallbackUpsertSetting } from '../../lib/fallbackStore'

const router = Router()

// GET /api/admin/settings
router.get('/', async (_req, res) => {
  try {
    const { db } = await connectToDatabase()
    const settings = await db.collection('settings').find({}).toArray()

    const settingsObj: Record<string, string> = {}
    settings.forEach((s: any) => {
      settingsObj[s.key] = s.value
    })

    return res.json({ success: true, settings: settingsObj })
  } catch (error) {
    console.error('Settings fetch error:', error)
    const settings = await fallbackGetSettings()
    return res.json({ success: true, settings })
  }
})

// POST /api/admin/settings
router.post('/', async (req, res) => {
  try {
    const body = req.body || {}
    const { db } = await connectToDatabase()
    const { key, value } = body

    if (!key) {
      return res.status(400).json({ success: false, error: 'Key is required' })
    }

    await db.collection('settings').updateOne(
      { key },
      {
        $set: {
          key,
          value: value || '',
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    )

    return res.json({ success: true })
  } catch (error) {
    console.error('Settings update error:', error)
    const body = req.body || {}
    const { key, value } = body
    if (!key) return res.status(400).json({ success: false, error: 'Key is required' })
    await fallbackUpsertSetting(String(key), String(value || ''))
    return res.json({ success: true })
  }
})

export default router

