import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase, Order } from '@/lib/mongodb'

function generateOrderNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `TB${year}${month}${day}${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { db } = await connectToDatabase()

    const order: Order = {
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
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('orders').insertOne(order)
    
    return NextResponse.json({ 
      success: true, 
      orderNumber: order.orderNumber,
      orderId: result.insertedId 
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    const { db } = await connectToDatabase()
    
    const query = status && status !== 'all' ? { status } : {}
    const orders = await db.collection('orders')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()
    
    return NextResponse.json({ success: true, orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 })
  }
}
