import { Router } from 'express'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '../lib/db'
import {
  fallbackCreateOrder,
  fallbackDeleteOrder,
  fallbackFindByOrderNumber,
  fallbackGetOrders,
  fallbackUpdateOrder,
} from '../lib/fallbackOrders'

const router = Router()

function generateOrderNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `TB${year}${month}${day}${random}`
}

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const body = req.body || {}

    const order = {
      orderNumber: generateOrderNumber(),
      customerName: body.customerName,
      phone: body.phone,
      email: body.email || '',
      cakeType: body.cakeType,
      size: body.size,
      flavor: body.flavor,
      deliveryDate: body.deliveryDate,
      deliveryTime: body.deliveryTime,
      deliveryAddress: body.deliveryAddress,
      deliveryArea: body.deliveryArea || '',
      deliveryCharge: body.deliveryCharge || 0,
      referenceImage: body.referenceImage || '',
      specialInstructions: body.specialInstructions || '',
      estimatedPrice: body.estimatedPrice || 0,
      status: 'pending' as const,
    }

    try {
      const { db } = await connectToDatabase()
      const result = await db.collection('orders').insertOne({
        ...order,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      return res.json({
        success: true,
        orderNumber: order.orderNumber,
        orderId: (result as any).insertedId,
      })
    } catch (dbError) {
      console.warn('Mongo unavailable, using fallback order store', dbError)
      const created = await fallbackCreateOrder({
        ...order,
      })
      return res.json({
        success: true,
        orderNumber: created.orderNumber,
        orderId: created._id,
      })
    }
  } catch (error) {
    console.error('Error creating order:', error)
    return res.status(500).json({ success: false, error: 'Failed to create order' })
  }
})

// GET /api/orders?status=pending|all
router.get('/', async (req, res) => {
  try {
    const status = req.query.status
    try {
      const { db } = await connectToDatabase()

      const query = status && status !== 'all' ? { status } : {}

      const orders = await db
        .collection('orders')
        .find(query)
        .sort({ createdAt: -1 })
        .toArray()

      return res.json({ success: true, orders })
    } catch (dbError) {
      console.warn('Mongo unavailable, using fallback order store', dbError)
      const orders = await fallbackGetOrders(status as string | undefined)
      return res.json({ success: true, orders })
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch orders' })
  }
})

// PATCH /api/orders/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const body = req.body || {}
    try {
      const { db } = await connectToDatabase()

      const result = await db.collection('orders').updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...body,
            updatedAt: new Date(),
          },
        },
      )

      if ((result as any).matchedCount === 0) {
        return res.status(404).json({ success: false, error: 'Order not found' })
      }

      return res.json({ success: true })
    } catch (dbError) {
      console.warn('Mongo unavailable, using fallback order store', dbError)
      const updated = await fallbackUpdateOrder(id, {
        ...body,
      })
      if (!updated) return res.status(404).json({ success: false, error: 'Order not found' })
      return res.json({ success: true })
    }
  } catch (error) {
    console.error('Error updating order:', error)
    return res.status(500).json({ success: false, error: 'Failed to update order' })
  }
})

// DELETE /api/orders/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    try {
      const { db } = await connectToDatabase()

      const result = await db.collection('orders').deleteOne({ _id: new ObjectId(id) })

      if ((result as any).deletedCount === 0) {
        return res.status(404).json({ success: false, error: 'Order not found' })
      }

      return res.json({ success: true })
    } catch (dbError) {
      console.warn('Mongo unavailable, using fallback order store', dbError)
      const deleted = await fallbackDeleteOrder(id)
      if (!deleted) return res.status(404).json({ success: false, error: 'Order not found' })
      return res.json({ success: true })
    }
  } catch (error) {
    console.error('Error deleting order:', error)
    return res.status(500).json({ success: false, error: 'Failed to delete order' })
  }
})

// GET /api/orders/track?orderNumber=TB...
router.get('/track', async (req, res) => {
  try {
    const orderNumber = req.query.orderNumber
    if (!orderNumber) {
      return res.status(400).json({ success: false, error: 'Order number required' })
    }
    try {
      const { db } = await connectToDatabase()
      const order = await db.collection('orders').findOne({ orderNumber: String(orderNumber).toUpperCase() })

      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' })
      }

      return res.json({
        success: true,
        order: {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          phone: order.phone,
          cakeType: order.cakeType,
          size: order.size,
          flavor: order.flavor,
          deliveryDate: order.deliveryDate,
          deliveryTime: order.deliveryTime,
          deliveryAddress: order.deliveryAddress,
          deliveryArea: order.deliveryArea,
          deliveryCharge: order.deliveryCharge,
          estimatedPrice: order.estimatedPrice,
          status: order.status,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
      })
    } catch (dbError) {
      console.warn('Mongo unavailable, using fallback order store', dbError)
      const order = await fallbackFindByOrderNumber(String(orderNumber))
      if (!order) return res.status(404).json({ success: false, error: 'Order not found' })

      return res.json({
        success: true,
        order: {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          phone: order.phone,
          cakeType: order.cakeType,
          size: order.size,
          flavor: order.flavor,
          deliveryDate: order.deliveryDate,
          deliveryTime: order.deliveryTime,
          deliveryAddress: order.deliveryAddress,
          deliveryArea: order.deliveryArea,
          deliveryCharge: order.deliveryCharge,
          estimatedPrice: order.estimatedPrice,
          status: order.status,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
      })
    }
  } catch (error) {
    console.error('Error tracking order:', error)
    return res.status(500).json({ success: false, error: 'Failed to track order' })
  }
})

export default router

