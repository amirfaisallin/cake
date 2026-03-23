import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

type Doc = { _id: string }

const dataDir = path.join(process.cwd(), 'data')

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true })
}

function collectionFile(collectionName: string) {
  return path.join(dataDir, `${collectionName}.fallback.json`)
}

async function readJsonArray<T extends Doc>(collectionName: string, seed: T[]): Promise<T[]> {
  await ensureDataDir()
  const file = collectionFile(collectionName)
  try {
    const raw = await fs.readFile(file, 'utf8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as T[]
    return seed
  } catch (e: any) {
    if (e?.code === 'ENOENT') {
      await fs.writeFile(file, JSON.stringify(seed, null, 2), 'utf8')
      return seed
    }
    return seed
  }
}

async function writeJsonArray<T extends Doc>(collectionName: string, docs: T[]) {
  await ensureDataDir()
  const file = collectionFile(collectionName)
  await fs.writeFile(file, JSON.stringify(docs, null, 2), 'utf8')
}

function uuid() {
  // node 19+ has crypto.randomUUID
  return crypto.randomUUID()
}

export type FallbackCategory = {
  _id: string
  name: string
  slug: string
  description?: string
  active: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export type FallbackFoodItem = {
  _id: string
  name: string
  slug: string
  description?: string
  price: number
  image: string
  categoryId: string
  categoryName?: string
  tags: string[]
  sizes: { name: string; price: number }[]
  active: boolean
  featured: boolean
  createdAt: string
  updatedAt: string
}

export type FallbackDeliveryArea = {
  _id: string
  name: string
  charge: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export type FallbackMenuItem = {
  _id: string
  type: 'cake_type' | 'size' | 'flavor'
  name: string
  label: string
  price?: number
  multiplier?: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export type FallbackSettings = Record<string, string>

const nowIso = () => new Date().toISOString()

export async function fallbackGetCategories(): Promise<FallbackCategory[]> {
  const seed: FallbackCategory[] = [
    {
      _id: 'cakes',
      name: 'Cakes',
      slug: 'cakes',
      description: '',
      active: true,
      order: 1,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      _id: 'wedding',
      name: 'Wedding',
      slug: 'wedding',
      description: '',
      active: true,
      order: 2,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ]
  const docs = await readJsonArray<FallbackCategory>('categories', seed)
  return docs
}

export async function fallbackUpsertCategory(category: Omit<FallbackCategory, 'createdAt' | 'updatedAt'> & { _id?: string }): Promise<FallbackCategory> {
  const docs = await fallbackGetCategories()
  const id = category._id || uuid()
  const next: FallbackCategory = {
    _id: id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? '',
    active: category.active,
    order: category.order,
    createdAt: docs.find((d) => d._id === id)?.createdAt || nowIso(),
    updatedAt: nowIso(),
  }
  const idx = docs.findIndex((d) => d._id === id)
  const out = idx === -1 ? [next, ...docs] : docs.map((d) => (d._id === id ? next : d))
  await writeJsonArray('categories', out)
  return next
}

export async function fallbackDeleteCategory(id: string): Promise<boolean> {
  const docs = await fallbackGetCategories()
  const next = docs.filter((d) => d._id !== id)
  const deleted = next.length !== docs.length
  if (deleted) await writeJsonArray('categories', next)
  return deleted
}

export async function fallbackGetFoodItems(): Promise<FallbackFoodItem[]> {
  const seed: FallbackFoodItem[] = [
    {
      _id: 'seed-1',
      name: 'Chocolate Cake',
      slug: 'chocolate-cake',
      description: 'Rich chocolate layers with smooth frosting.',
      price: 1200,
      image: '/images/chocolate-cake.jpg',
      categoryId: 'cakes',
      categoryName: 'Cakes',
      tags: ['featured'],
      sizes: [],
      active: true,
      featured: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      _id: 'seed-2',
      name: 'Strawberry Cake',
      slug: 'strawberry-cake',
      description: 'Fresh strawberry cream with soft sponge.',
      price: 1100,
      image: '/images/strawberry-cake.jpg',
      categoryId: 'cakes',
      categoryName: 'Cakes',
      tags: [],
      sizes: [],
      active: true,
      featured: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      _id: 'seed-3',
      name: 'Vanilla Wedding Cake',
      slug: 'vanilla-wedding-cake',
      description: 'Classic vanilla with elegant finishing.',
      price: 2500,
      image: '/images/wedding-cake.jpg',
      categoryId: 'wedding',
      categoryName: 'Wedding',
      tags: [],
      sizes: [],
      active: true,
      featured: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      _id: 'seed-4',
      name: 'Red Velvet Cake',
      slug: 'red-velvet-cake',
      description: 'Soft cocoa crumb with cream cheese notes.',
      price: 1300,
      image: '/images/red-velvet-cake.jpg',
      categoryId: 'cakes',
      categoryName: 'Cakes',
      tags: [],
      sizes: [],
      active: true,
      featured: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ]
  const docs = await readJsonArray<FallbackFoodItem>('food_items', seed)
  return docs
}

export async function fallbackUpsertFoodItem(item: Omit<FallbackFoodItem, 'createdAt' | 'updatedAt'> & { _id?: string }): Promise<FallbackFoodItem> {
  const docs = await fallbackGetFoodItems()
  const id = item._id || uuid()
  const existing = docs.find((d) => d._id === id)
  const next: FallbackFoodItem = {
    _id: id,
    name: item.name,
    slug: item.slug,
    description: item.description ?? '',
    price: item.price,
    image: item.image ?? '',
    categoryId: item.categoryId,
    categoryName: item.categoryName ?? '',
    tags: item.tags ?? [],
    sizes: item.sizes ?? [],
    active: item.active,
    featured: item.featured,
    createdAt: existing?.createdAt || nowIso(),
    updatedAt: nowIso(),
  }
  const idx = docs.findIndex((d) => d._id === id)
  const out = idx === -1 ? [next, ...docs] : docs.map((d) => (d._id === id ? next : d))
  await writeJsonArray('food_items', out)
  return next
}

export async function fallbackDeleteFoodItem(id: string): Promise<boolean> {
  const docs = await fallbackGetFoodItems()
  const next = docs.filter((d) => d._id !== id)
  const deleted = next.length !== docs.length
  if (deleted) await writeJsonArray('food_items', next)
  return deleted
}

export async function fallbackGetDeliveryAreas(): Promise<FallbackDeliveryArea[]> {
  const seed: FallbackDeliveryArea[] = [
    {
      _id: 'area-1',
      name: 'Uttara',
      charge: 60,
      active: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      _id: 'area-2',
      name: 'Gulshan',
      charge: 80,
      active: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ]
  const docs = await readJsonArray<FallbackDeliveryArea>('delivery_areas', seed)
  return docs
}

export async function fallbackUpsertDeliveryArea(area: Omit<FallbackDeliveryArea, 'createdAt' | 'updatedAt'> & { _id?: string }): Promise<FallbackDeliveryArea> {
  const docs = await fallbackGetDeliveryAreas()
  const id = area._id || uuid()
  const existing = docs.find((d) => d._id === id)
  const next: FallbackDeliveryArea = {
    _id: id,
    name: area.name,
    charge: area.charge,
    active: area.active,
    createdAt: existing?.createdAt || nowIso(),
    updatedAt: nowIso(),
  }
  const idx = docs.findIndex((d) => d._id === id)
  const out = idx === -1 ? [next, ...docs] : docs.map((d) => (d._id === id ? next : d))
  await writeJsonArray('delivery_areas', out)
  return next
}

export async function fallbackDeleteDeliveryArea(id: string): Promise<boolean> {
  const docs = await fallbackGetDeliveryAreas()
  const next = docs.filter((d) => d._id !== id)
  const deleted = next.length !== docs.length
  if (deleted) await writeJsonArray('delivery_areas', next)
  return deleted
}

export async function fallbackGetMenuItems(): Promise<FallbackMenuItem[]> {
  const seed: FallbackMenuItem[] = [
    // cake types
    { _id: 'm-birthday', type: 'cake_type', name: 'birthday', label: 'Birthday', price: 800, active: true, createdAt: nowIso(), updatedAt: nowIso() },
    { _id: 'm-wedding', type: 'cake_type', name: 'wedding', label: 'Wedding', price: 2500, active: true, createdAt: nowIso(), updatedAt: nowIso() },
    { _id: 'm-anniversary', type: 'cake_type', name: 'anniversary', label: 'Anniversary', price: 1200, active: true, createdAt: nowIso(), updatedAt: nowIso() },
    { _id: 'm-custom', type: 'cake_type', name: 'custom', label: 'Custom', price: 1000, active: true, createdAt: nowIso(), updatedAt: nowIso() },
    // sizes
    { _id: 'm-0.5kg', type: 'size', name: '0.5kg', label: '0.5 kg', multiplier: 0.6, active: true, createdAt: nowIso(), updatedAt: nowIso() },
    { _id: 'm-1kg', type: 'size', name: '1kg', label: '1 kg', multiplier: 1, active: true, createdAt: nowIso(), updatedAt: nowIso() },
    { _id: 'm-1.5kg', type: 'size', name: '1.5kg', label: '1.5 kg', multiplier: 1.4, active: true, createdAt: nowIso(), updatedAt: nowIso() },
    { _id: 'm-2kg', type: 'size', name: '2kg', label: '2 kg', multiplier: 1.8, active: true, createdAt: nowIso(), updatedAt: nowIso() },
    { _id: 'm-3kg', type: 'size', name: '3kg', label: '3 kg+', multiplier: 2.5, active: true, createdAt: nowIso(), updatedAt: nowIso() },
    // flavors
    { _id: 'm-chocolate', type: 'flavor', name: 'chocolate', label: 'Chocolate', active: true, createdAt: nowIso(), updatedAt: nowIso() },
    { _id: 'm-vanilla', type: 'flavor', name: 'vanilla', label: 'Vanilla', active: true, createdAt: nowIso(), updatedAt: nowIso() },
    { _id: 'm-red-velvet', type: 'flavor', name: 'red-velvet', label: 'Red Velvet', active: true, createdAt: nowIso(), updatedAt: nowIso() },
    { _id: 'm-strawberry', type: 'flavor', name: 'strawberry', label: 'Strawberry', active: true, createdAt: nowIso(), updatedAt: nowIso() },
    { _id: 'm-butterscotch', type: 'flavor', name: 'butterscotch', label: 'Butterscotch', active: true, createdAt: nowIso(), updatedAt: nowIso() },
  ]
  const docs = await readJsonArray<FallbackMenuItem>('menu_items', seed)
  return docs
}

export async function fallbackUpsertMenuItem(item: Omit<FallbackMenuItem, 'createdAt' | 'updatedAt'> & { _id?: string }): Promise<FallbackMenuItem> {
  const docs = await fallbackGetMenuItems()
  const id = item._id || uuid()
  const existing = docs.find((d) => d._id === id)
  const next: FallbackMenuItem = {
    _id: id,
    type: item.type,
    name: item.name,
    label: item.label,
    price: item.price,
    multiplier: item.multiplier,
    active: item.active,
    createdAt: existing?.createdAt || nowIso(),
    updatedAt: nowIso(),
  }
  const idx = docs.findIndex((d) => d._id === id)
  const out = idx === -1 ? [next, ...docs] : docs.map((d) => (d._id === id ? next : d))
  await writeJsonArray('menu_items', out)
  return next
}

export async function fallbackDeleteMenuItem(id: string): Promise<boolean> {
  const docs = await fallbackGetMenuItems()
  const next = docs.filter((d) => d._id !== id)
  const deleted = next.length !== docs.length
  if (deleted) await writeJsonArray('menu_items', next)
  return deleted
}

const settingsFile = path.join(dataDir, `settings.fallback.json`)

async function readSettingsObj(seed: FallbackSettings): Promise<FallbackSettings> {
  await ensureDataDir()
  try {
    const raw = await fs.readFile(settingsFile, 'utf8')
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed as FallbackSettings
    return seed
  } catch (e: any) {
    if (e?.code === 'ENOENT') {
      await fs.writeFile(settingsFile, JSON.stringify(seed, null, 2), 'utf8')
      return seed
    }
    return seed
  }
}

async function writeSettingsObj(obj: FallbackSettings) {
  await ensureDataDir()
  await fs.writeFile(settingsFile, JSON.stringify(obj, null, 2), 'utf8')
}

export async function fallbackGetSettings(): Promise<FallbackSettings> {
  const seed: FallbackSettings = {
    hero_image: '/images/hero-cake.jpg',
  }
  return readSettingsObj(seed)
}

export async function fallbackUpsertSetting(key: string, value: string): Promise<FallbackSettings> {
  const current = await fallbackGetSettings()
  const next = { ...current, [key]: value }
  await writeSettingsObj(next)
  return next
}

