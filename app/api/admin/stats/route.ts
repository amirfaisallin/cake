import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    
    const totalOrders = await db.collection('orders').countDocuments()
    const pendingOrders = await db.collection('orders').countDocuments({ status: 'pending' })
    const confirmedOrders = await db.collection('orders').countDocuments({ status: 'confirmed' })
    const preparingOrders = await db.collection('orders').countDocuments({ status: 'preparing' })
    const deliveredOrders = await db.collection('orders').countDocuments({ status: 'delivered' })
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayOrders = await db.collection('orders').countDocuments({
      createdAt: { $gte: today }
    })

    const revenueResult = await db.collection('orders').aggregate([
      { $match: { status: { $in: ['confirmed', 'preparing', 'ready', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$estimatedPrice' } } }
    ]).toArray()
    
    const totalRevenue = revenueResult[0]?.total || 0

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        preparingOrders,
        deliveredOrders,
        todayOrders,
        totalRevenue
      }
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 })
  }
}
