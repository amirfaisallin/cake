import { MongoClient, Db } from 'mongodb'

const MONGODB_URI = 'mongodb+srv://amirfaisallinkon2_db_user:vJud10ZGDEtAYDim@tinybites.prcyth4.mongodb.net/?appName=tinyBites'
const MONGODB_DB = 'sweet_delights'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db(MONGODB_DB)

  cachedClient = client
  cachedDb = db

  return { client, db }
}

export interface Order {
  _id?: string
  orderNumber: string
  customerName: string
  phone: string
  email?: string
  cakeType: string
  size: string
  flavor: string
  deliveryDate: string
  deliveryTime: string
  deliveryAddress: string
  deliveryArea?: string
  deliveryCharge?: number
  referenceImage?: string
  specialInstructions?: string
  estimatedPrice: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export interface MenuItem {
  _id?: string
  type: 'cake_type' | 'size' | 'flavor'
  name: string
  label: string
  price?: number
  multiplier?: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface DeliveryArea {
  _id?: string
  name: string
  charge: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface FoodCategory {
  _id?: string
  name: string
  slug: string
  description?: string
  active: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface FoodItem {
  _id?: string
  name: string
  slug: string
  description?: string
  price: number
  image?: string
  categoryId: string
  categoryName?: string
  tags: string[]
  sizes?: { name: string; price: number }[]
  active: boolean
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SiteSettings {
  _id?: string
  key: string
  value: string
  updatedAt: Date
}
