import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const areas = await db.collection('delivery_areas').find({}).sort({ name: 1 }).toArray()
    return NextResponse.json({ success: true, areas })
  } catch (error) {
    console.error('Error fetching delivery areas:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch delivery areas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { db } = await connectToDatabase()

    const area = {
      name: body.name,
      charge: body.charge || 0,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('delivery_areas').insertOne(area)
    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error('Error creating delivery area:', error)
    return NextResponse.json({ success: false, error: 'Failed to create delivery area' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    const { db } = await connectToDatabase()

    await db.collection('delivery_areas').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating delivery area:', error)
    return NextResponse.json({ success: false, error: 'Failed to update delivery area' }, { status: 500 })
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
    await db.collection('delivery_areas').deleteOne({ _id: new ObjectId(id) })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting delivery area:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete delivery area' }, { status: 500 })
  }
}
