import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured') === 'true'
    
    const { db } = await connectToDatabase()
    
    const query: Record<string, unknown> = { active: true }
    if (category && category !== 'all') query.categoryId = category
    if (featured) query.featured = true
    
    const [items, categories] = await Promise.all([
      db.collection('food_items').find(query).sort({ featured: -1, createdAt: -1 }).toArray(),
      db.collection('categories').find({ active: true }).sort({ order: 1 }).toArray()
    ])
    
    return NextResponse.json({ items, categories })
  } catch (error) {
    console.error('Failed to fetch food data:', error)
    return NextResponse.json({ items: [], categories: [] })
  }
}
