import { Router } from 'express'
import { connectToDatabase } from '../lib/db'
import { fallbackGetDeliveryAreas, fallbackGetMenuItems } from '../lib/fallbackStore'

const router = Router()

// GET /api/menu
router.get('/', async (_req, res) => {
  try {
    const { db } = await connectToDatabase()

    const [menuItems, deliveryAreas] = await Promise.all([
      db.collection('menu_items').find({ active: true }).toArray(),
      db.collection('delivery_areas').find({ active: true }).sort({ name: 1 }).toArray(),
    ])

    const cakeTypes = menuItems
      .filter((i: any) => i.type === 'cake_type')
      .map((i: any) => ({
        id: i.name,
        label: i.label,
        price: i.price,
      }))

    const sizes = menuItems
      .filter((i: any) => i.type === 'size')
      .map((i: any) => ({
        id: i.name,
        label: i.label,
        multiplier: i.multiplier,
      }))

    const flavors = menuItems
      .filter((i: any) => i.type === 'flavor')
      .map((i: any) => ({
        id: i.name,
        label: i.label,
      }))

    const areas = deliveryAreas.map((a: any) => ({
      id: a._id.toString(),
      name: a.name,
      charge: a.charge,
    }))

    res.json({
      success: true,
      cakeTypes,
      sizes,
      flavors,
      deliveryAreas: areas,
    })
  } catch (error) {
    console.error('Error fetching menu data:', error)
    const menuItems = await fallbackGetMenuItems()
    const deliveryAreas = await fallbackGetDeliveryAreas()

    const activeMenu = menuItems.filter((i) => i.active === true)
    const cakeTypes = activeMenu
      .filter((i: any) => i.type === 'cake_type')
      .map((i: any) => ({ id: i.name, label: i.label, price: i.price }))

    const sizes = activeMenu
      .filter((i: any) => i.type === 'size')
      .map((i: any) => ({ id: i.name, label: i.label, multiplier: i.multiplier }))

    const flavors = activeMenu
      .filter((i: any) => i.type === 'flavor')
      .map((i: any) => ({ id: i.name, label: i.label }))

    const areas = deliveryAreas
      .filter((a) => a.active === true)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((a) => ({ id: a._id.toString(), name: a.name, charge: a.charge }))

    res.json({
      success: true,
      cakeTypes,
      sizes,
      flavors,
      deliveryAreas: areas,
    })
  }
})

export default router

