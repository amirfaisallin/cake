import { NextResponse } from 'next/server'
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
    return NextResponse.json({ success: false, settings: {} })
  }
}
