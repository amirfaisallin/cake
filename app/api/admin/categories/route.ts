import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase, FoodCategory } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const categories = await db
      .collection('categories')
      .find({})
      .sort({ order: 1, createdAt: -1 })
      .toArray()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { db } = await connectToDatabase()
    
    const slug = body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    
    const category: Omit<FoodCategory, '_id'> = {
      name: body.name,
      slug,
      description: body.description || '',
      active: body.active ?? true,
      order: body.order ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const result = await db.collection('categories').insertOne(category)
    return NextResponse.json({ ...category, _id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error('Failed to create category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { _id, ...updateData } = body
    const { db } = await connectToDatabase()
    
    if (updateData.name) {
      updateData.slug = updateData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }
    updateData.updatedAt = new Date()
    
    await db.collection('categories').updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }
    
    const { db } = await connectToDatabase()
    await db.collection('categories').deleteOne({ _id: new ObjectId(id) })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
