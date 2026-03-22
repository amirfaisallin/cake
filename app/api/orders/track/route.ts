import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')
    
    if (!orderNumber) {
      return NextResponse.json({ success: false, error: 'Order number required' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const order = await db.collection('orders').findOne({ orderNumber: orderNumber.toUpperCase() })
    
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ 
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
      }
    })
  } catch (error) {
    console.error('Error tracking order:', error)
    return NextResponse.json({ success: false, error: 'Failed to track order' }, { status: 500 })
  }
}
