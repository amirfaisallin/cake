import { Router } from 'express'
import { connectToDatabase } from '../../lib/db'
import { fallbackGetOrders } from '../../lib/fallbackOrders'

const router = Router()

// GET /api/admin/stats
router.get('/', async (_req, res) => {
  try {
    const { db } = await connectToDatabase()

    const totalOrders = await db.collection('orders').countDocuments()
    const pendingOrders = await db.collection('orders').countDocuments({ status: 'pending' })
    const confirmedOrders = await db.collection('orders').countDocuments({ status: 'confirmed' })
    const preparingOrders = await db.collection('orders').countDocuments({ status: 'preparing' })
    const readyOrders = await db.collection('orders').countDocuments({ status: 'ready' })
    const deliveredOrders = await db.collection('orders').countDocuments({ status: 'delivered' })
    const cancelledOrders = await db.collection('orders').countDocuments({ status: 'cancelled' })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayOrders = await db.collection('orders').countDocuments({
      createdAt: { $gte: today },
    })

    const revenueResult = await db.collection('orders').aggregate([
      { $match: { status: { $in: ['confirmed', 'preparing', 'ready', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$estimatedPrice' } } },
    ]).toArray()

    const totalRevenue = (revenueResult[0] as any)?.total || 0

    const stats = {
      total: totalOrders,
      pending: pendingOrders,
      confirmed: confirmedOrders,
      preparing: preparingOrders,
      ready: readyOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
      todayOrders,
      totalRevenue,
    }

    // Keep both shapes for compatibility.
    return res.json({ success: true, ...stats, stats })
  } catch (error) {
    console.error('Error fetching stats:', error)
    // DB unavailable => compute from fallback orders so dashboard stays meaningful.
    const orders = await fallbackGetOrders('all')

    const countBy = (status: string) => orders.filter((o: any) => String(o.status) === status).length
    const total = orders.length
    const pending = countBy('pending')
    const confirmed = countBy('confirmed')
    const preparing = countBy('preparing')
    const ready = countBy('ready')
    const delivered = countBy('delivered')
    const cancelled = countBy('cancelled')

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayOrders = orders.filter((o: any) => {
      try {
        const d = new Date(o.createdAt)
        return d >= today
      } catch {
        return false
      }
    }).length

    const totalRevenue = orders
      .filter((o: any) => ['confirmed', 'preparing', 'ready', 'delivered'].includes(String(o.status)))
      .reduce((sum: number, o: any) => sum + Number(o.estimatedPrice || 0), 0)

    const stats = {
      total,
      pending,
      confirmed,
      preparing,
      ready,
      delivered,
      cancelled,
      todayOrders,
      totalRevenue,
    }

    return res.json({ success: true, ...stats, stats })
  }
})

export default router

