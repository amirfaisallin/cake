import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const items = await db.collection('menu_items').find({}).sort({ createdAt: -1 }).toArray()
    return NextResponse.json({ success: true, items })
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch menu items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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
    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error('Error creating menu item:', error)
    return NextResponse.json({ success: false, error: 'Failed to create menu item' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    const { db } = await connectToDatabase()

    await db.collection('menu_items').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating menu item:', error)
    return NextResponse.json({ success: false, error: 'Failed to update menu item' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    await db.collection('menu_items').deleteOne({ _id: new ObjectId(id) })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting menu item:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete menu item' }, { status: 500 })
  }
}
