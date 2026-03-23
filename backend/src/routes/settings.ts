import { Router } from 'express'
import { connectToDatabase } from '../lib/db'
import { fallbackGetSettings } from '../lib/fallbackStore'

const router = Router()

// GET /api/settings
router.get('/', async (_req, res) => {
  try {
    const { db } = await connectToDatabase()
    const settings = await db.collection('settings').find({}).toArray()

    const settingsObj: Record<string, string> = {}
    settings.forEach((s: any) => {
      settingsObj[s.key] = s.value
    })

    res.json({ success: true, settings: settingsObj })
  } catch (error) {
    console.error('Settings fetch error:', error)
    const settings = await fallbackGetSettings()
    res.json({ success: true, settings })
  }
})

export default router

