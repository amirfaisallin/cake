import { Router } from 'express'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '../../lib/db'
import { fallbackDeleteCategory, fallbackGetCategories, fallbackUpsertCategory } from '../../lib/fallbackStore'

const router = Router()

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

// GET /api/admin/categories
router.get('/', async (_req, res) => {
  try {
    const { db } = await connectToDatabase()
    const categories = await db
      .collection('categories')
      .find({})
      .sort({ order: 1, createdAt: -1 })
      .toArray()
    return res.json(categories)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    const categories = await fallbackGetCategories()
    return res.json(
      categories
        .slice()
        .sort((a, b) => a.order - b.order || (b.createdAt < a.createdAt ? -1 : 1)),
    )
  }
})

// POST /api/admin/categories
router.post('/', async (req, res) => {
  const body = req.body || {}
  try {
    const { db } = await connectToDatabase()

    const slug = slugify(String(body.name || ''))

    const category = {
      name: body.name,
      slug,
      description: body.description || '',
      active: body.active ?? true,
      order: body.order ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('categories').insertOne(category)

    return res.status(201).json({ ...category, _id: (result as any).insertedId })
  } catch (error) {
    console.error('Failed to create category:', error)
    const slug = slugify(String(body.name || ''))
    const next = await fallbackUpsertCategory({
      name: body.name,
      slug,
      description: body.description || '',
      active: body.active ?? true,
      order: body.order ?? 0,
      _id: undefined,
    } as any)
    return res.status(201).json(next)
  }
})

// PATCH /api/admin/categories
router.patch('/', async (req, res) => {
  const body = req.body || {}
  try {
    const { _id, ...updateData } = body
    const { db } = await connectToDatabase()

    if (updateData.name) {
      updateData.slug = slugify(String(updateData.name))
    }
    updateData.updatedAt = new Date()

    await db.collection('categories').updateOne({ _id: new ObjectId(_id) }, { $set: updateData })

    return res.json({ success: true })
  } catch (error) {
    console.error('Failed to update category:', error)
    const { _id, ...updateData } = body
    if (!_id) return res.status(400).json({ error: 'ID required' })

    const current = (await fallbackGetCategories()).find((c) => c._id === String(_id))
    const slug = updateData?.name ? slugify(String(updateData.name)) : current?.slug || ''

    const next = await fallbackUpsertCategory({
      _id: String(_id),
      name: (updateData as any)?.name ?? current?.name ?? '',
      slug,
      description: (updateData as any)?.description ?? current?.description ?? '',
      active: (updateData as any)?.active ?? current?.active ?? true,
      order: Number((updateData as any)?.order ?? current?.order ?? 0),
    } as any)

    return res.json({ success: true, category: next })
  }
})

// DELETE /api/admin/categories?id=...
router.delete('/', async (req, res) => {
  try {
    const id = req.query.id
    if (!id) {
      return res.status(400).json({ error: 'ID required' })
    }

    const { db } = await connectToDatabase()
    await db.collection('categories').deleteOne({ _id: new ObjectId(String(id)) })

    return res.json({ success: true })
  } catch (error) {
    console.error('Failed to delete category:', error)
    const id = req.query.id
    if (!id) return res.status(400).json({ error: 'ID required' })
    const deleted = await fallbackDeleteCategory(String(id))
    if (!deleted) return res.status(404).json({ error: 'Category not found' })
    return res.json({ success: true })
  }
})

export default router

