import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase, FoodItem } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const activeOnly = searchParams.get('active') === 'true'
    
    const { db } = await connectToDatabase()
    
    const query: Record<string, unknown> = {}
    if (category) query.categoryId = category
    if (activeOnly) query.active = true
    
    const items = await db
      .collection('food_items')
      .find(query)
      .sort({ featured: -1, createdAt: -1 })
      .toArray()
    return NextResponse.json(items)
  } catch (error) {
    console.error('Failed to fetch food items:', error)
    return NextResponse.json({ error: 'Failed to fetch food items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { db } = await connectToDatabase()
    
    const slug = body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    
    // Get category name
    let categoryName = ''
    if (body.categoryId) {
      const category = await db.collection('categories').findOne({ _id: new ObjectId(body.categoryId) })
      categoryName = category?.name || ''
    }
    
    const item: Omit<FoodItem, '_id'> = {
      name: body.name,
      slug,
      description: body.description || '',
      price: Number(body.price) || 0,
      image: body.image || '',
      categoryId: body.categoryId || '',
      categoryName,
      tags: body.tags || [],
      sizes: body.sizes || [],
      active: body.active ?? true,
      featured: body.featured ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const result = await db.collection('food_items').insertOne(item)
    return NextResponse.json({ ...item, _id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error('Failed to create food item:', error)
    return NextResponse.json({ error: 'Failed to create food item' }, { status: 500 })
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
    
    // Update category name if categoryId changed
    if (updateData.categoryId) {
      const category = await db.collection('categories').findOne({ _id: new ObjectId(updateData.categoryId) })
      updateData.categoryName = category?.name || ''
    }
    
    if (updateData.price) updateData.price = Number(updateData.price)
    updateData.updatedAt = new Date()
    
    await db.collection('food_items').updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update food item:', error)
    return NextResponse.json({ error: 'Failed to update food item' }, { status: 500 })
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
    await db.collection('food_items').deleteOne({ _id: new ObjectId(id) })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete food item:', error)
    return NextResponse.json({ error: 'Failed to delete food item' }, { status: 500 })
  }
}
