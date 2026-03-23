import { Router } from 'express'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '../../lib/db'
import {
  fallbackDeleteMenuItem,
  fallbackGetMenuItems,
  fallbackUpsertMenuItem,
} from '../../lib/fallbackStore'

const router = Router()

// GET /api/admin/menu
router.get('/', async (_req, res) => {
  try {
    const { db } = await connectToDatabase()
    const items = await db.collection('menu_items').find({}).sort({ createdAt: -1 }).toArray()
    return res.json({ success: true, items })
  } catch (error) {
    console.error('Error fetching menu items:', error)
    const items = await fallbackGetMenuItems()
    return res.json({
      success: false,
      items: items.slice().sort((a, b) => (b.createdAt < a.createdAt ? -1 : 1)),
    })
  }
})

// POST /api/admin/menu
router.post('/', async (req, res) => {
  try {
    const body = req.body || {}
    const { db } = await connectToDatabase()

    const item = {
      type: body.type,
      name: body.name,
      label: body.label,
      price: body.price || 0,
      multiplier: body.multiplier || 1,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('menu_items').insertOne(item)
    return res.json({ success: true, id: (result as any).insertedId })
  } catch (error) {
    console.error('Error creating menu item:', error)
    const body = req.body || {}
    const next = await fallbackUpsertMenuItem({
      type: body.type,
      name: body.name,
      label: body.label,
      price: body.price || 0,
      multiplier: body.multiplier || 1,
      active: true,
    } as any)
    return res.json({ success: true, id: next._id })
  }
})

// PATCH /api/admin/menu
router.patch('/', async (req, res) => {
  try {
    const body = req.body || {}
    const { id, ...updates } = body
    const { db } = await connectToDatabase()

    await db
      .collection('menu_items')
      .updateOne({ _id: new ObjectId(id) }, { $set: { ...updates, updatedAt: new Date() } })

    return res.json({ success: true })
  } catch (error) {
    console.error('Error updating menu item:', error)
    const body = req.body || {}
    const { id, ...updates } = body
    if (!id) return res.status(400).json({ success: false, error: 'ID required' })

    const current = (await fallbackGetMenuItems()).find((i) => i._id === String(id))
    if (!current) return res.status(404).json({ success: false, error: 'Menu item not found' })

    const next = await fallbackUpsertMenuItem({
      _id: String(id),
      type: updates.type ?? current.type,
      name: updates.name ?? current.name,
      label: updates.label ?? current.label,
      price: updates.price != null ? Number(updates.price) : current.price,
      multiplier: updates.multiplier != null ? Number(updates.multiplier) : current.multiplier,
      active: updates.active ?? current.active,
    } as any)

    return res.json({ success: true })
  }
})

// DELETE /api/admin/menu?id=...
router.delete('/', async (req, res) => {
  try {
    const id = req.query.id
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID required' })
    }

    const { db } = await connectToDatabase()
    await db.collection('menu_items').deleteOne({ _id: new ObjectId(String(id)) })

    return res.json({ success: true })
  } catch (error) {
    console.error('Error deleting menu item:', error)
    const id = req.query.id
    if (!id) return res.status(400).json({ success: false, error: 'ID required' })
    const deleted = await fallbackDeleteMenuItem(String(id))
    if (!deleted) return res.status(404).json({ success: false, error: 'Menu item not found' })
    return res.json({ success: true })
  }
})

export default router

