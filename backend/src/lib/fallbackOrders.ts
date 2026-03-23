import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'

export type FallbackOrder = {
  _id: string
  orderNumber: string
  customerName: string
  phone: string
  email: string
  cakeType: string
  size: string
  flavor: string
  deliveryDate: string
  deliveryTime: string
  deliveryAddress: string
  deliveryArea: string
  deliveryCharge: number
  referenceImage: string
  specialInstructions: string
  estimatedPrice: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

const dataDir = path.join(process.cwd(), 'data')
const ordersFile = path.join(dataDir, 'orders.fallback.json')

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true })
}

async function readOrders(): Promise<FallbackOrder[]> {
  try {
    const raw = await fs.readFile(ordersFile, 'utf8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as FallbackOrder[]
    return []
  } catch (e: any) {
    if (e?.code === 'ENOENT') return []
    return []
  }
}

async function writeOrders(orders: FallbackOrder[]) {
  await ensureDataDir()
  await fs.writeFile(ordersFile, JSON.stringify(orders, null, 2), 'utf8')
}

export async function fallbackCreateOrder(order: Omit<FallbackOrder, '_id' | 'createdAt' | 'updatedAt'>) {
  const orders = await readOrders()
  const now = new Date().toISOString()
  const created: FallbackOrder = {
    _id: crypto.randomUUID(),
    ...order,
    createdAt: now,
    updatedAt: now,
  }
  orders.unshift(created)
  await writeOrders(orders)
  return created
}

export async function fallbackGetOrders(status?: string) {
  const orders = await readOrders()
  const filtered = status && status !== 'all' ? orders.filter((o) => o.status === status) : orders
  filtered.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  return filtered
}

export async function fallbackUpdateOrder(id: string, patch: Partial<FallbackOrder>) {
  const orders = await readOrders()
  const idx = orders.findIndex((o) => o._id === id)
  if (idx === -1) return null

  const now = new Date().toISOString()
  orders[idx] = {
    ...orders[idx],
    ...patch,
    updatedAt: now,
  }
  await writeOrders(orders)
  return orders[idx]
}

export async function fallbackDeleteOrder(id: string) {
  const orders = await readOrders()
  const next = orders.filter((o) => o._id !== id)
  const deleted = next.length !== orders.length
  if (deleted) await writeOrders(next)
  return deleted
}

export async function fallbackFindByOrderNumber(orderNumber: string) {
  const orders = await readOrders()
  return orders.find((o) => o.orderNumber === String(orderNumber).toUpperCase()) || null
}

