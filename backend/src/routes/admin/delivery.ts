import { Router } from 'express'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '../../lib/db'
import {
  fallbackDeleteDeliveryArea,
  fallbackGetDeliveryAreas,
  fallbackUpsertDeliveryArea,
} from '../../lib/fallbackStore'

const router = Router()

// GET /api/admin/delivery
router.get('/', async (_req, res) => {
  try {
    const { db } = await connectToDatabase()
    const areas = await db.collection('delivery_areas').find({}).sort({ name: 1 }).toArray()
    return res.json({ success: true, areas })
  } catch (error) {
    console.error('Error fetching delivery areas:', error)
    const areas = await fallbackGetDeliveryAreas()
    return res.json({ success: true, areas: areas.slice().sort((a, b) => a.name.localeCompare(b.name)) })
  }
})

// POST /api/admin/delivery
router.post('/', async (req, res) => {
  try {
    const body = req.body || {}
    const { db } = await connectToDatabase()

    const area = {
      name: body.name,
      charge: body.charge || 0,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('delivery_areas').insertOne(area)
    return res.json({ success: true, id: (result as any).insertedId })
  } catch (error) {
    console.error('Error creating delivery area:', error)
    const body = req.body || {}
    const next = await fallbackUpsertDeliveryArea({
      name: String(body.name || ''),
      charge: Number(body.charge) || 0,
      active: true,
      _id: undefined,
    } as any)
    return res.json({ success: true, id: next._id })
  }
})

// PATCH /api/admin/delivery
router.patch('/', async (req, res) => {
  try {
    const body = req.body || {}
    const { id, ...updates } = body
    const { db } = await connectToDatabase()

    await db.collection('delivery_areas').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } },
    )

    return res.json({ success: true })
  } catch (error) {
    console.error('Error updating delivery area:', error)
    const body = req.body || {}
    const { id, ...updates } = body
    if (!id) return res.status(400).json({ success: false, error: 'ID required' })

    const current = (await fallbackGetDeliveryAreas()).find((a) => a._id === String(id))
    if (!current) return res.status(404).json({ success: false, error: 'Area not found' })

    const next = await fallbackUpsertDeliveryArea({
      _id: String(id),
      name: updates.name ?? current.name,
      charge: updates.charge != null ? Number(updates.charge) : current.charge,
      active: updates.active ?? current.active,
      createdAt: current.createdAt,
      updatedAt: current.updatedAt,
    } as any)

    return res.json({ success: true })
  }
})

// DELETE /api/admin/delivery?id=...
router.delete('/', async (req, res) => {
  try {
    const id = req.query.id
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID required' })
    }

    const { db } = await connectToDatabase()
    await db.collection('delivery_areas').deleteOne({ _id: new ObjectId(String(id)) })

    return res.json({ success: true })
  } catch (error) {
    console.error('Error deleting delivery area:', error)
    const id = req.query.id
    if (!id) return res.status(400).json({ success: false, error: 'ID required' })
    const deleted = await fallbackDeleteDeliveryArea(String(id))
    if (!deleted) return res.status(404).json({ success: false, error: 'Area not found' })
    return res.json({ success: true })
  }
})

export default router

