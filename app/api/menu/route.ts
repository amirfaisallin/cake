import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    
    const [menuItems, deliveryAreas] = await Promise.all([
      db.collection('menu_items').find({ active: true }).toArray(),
      db.collection('delivery_areas').find({ active: true }).sort({ name: 1 }).toArray()
    ])

    const cakeTypes = menuItems.filter(i => i.type === 'cake_type').map(i => ({
      id: i.name,
      label: i.label,
      price: i.price
    }))

    const sizes = menuItems.filter(i => i.type === 'size').map(i => ({
      id: i.name,
      label: i.label,
      multiplier: i.multiplier
    }))

    const flavors = menuItems.filter(i => i.type === 'flavor').map(i => ({
      id: i.name,
      label: i.label
    }))

    const areas = deliveryAreas.map(a => ({
      id: a._id.toString(),
      name: a.name,
      charge: a.charge
    }))

    return NextResponse.json({ 
      success: true, 
      cakeTypes,
      sizes,
      flavors,
      deliveryAreas: areas
    })
  } catch (error) {
    console.error('Error fetching menu data:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch menu data' }, { status: 500 })
  }
}
