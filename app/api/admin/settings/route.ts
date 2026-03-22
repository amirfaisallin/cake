import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const settings = await db.collection('settings').find({}).toArray()
    
    const settingsObj: Record<string, string> = {}
    settings.forEach((s) => {
      settingsObj[s.key] = s.value
    })
    
    return NextResponse.json({ success: true, settings: settingsObj })
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const body = await request.json()
    const { key, value } = body

    if (!key) {
      return NextResponse.json({ success: false, error: 'Key is required' }, { status: 400 })
    }

    await db.collection('settings').updateOne(
      { key },
      { 
        $set: { 
          key,
          value: value || '',
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 })
  }
}
