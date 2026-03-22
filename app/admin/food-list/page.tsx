"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Pencil, Trash2, Loader2, Search, Eye, EyeOff, Star } from "lucide-react"
import Image from "next/image"

interface Category {
  _id: string
  name: string
}

interface FoodItem {
  _id: string
  name: string
  description: string
  price: number
  image: string
  categoryId: string
  categoryName: string
  tags: string[]
  active: boolean
  featured: boolean
}

export default function FoodListPage() {
  const router = useRouter()
  const [items, setItems] = useState<FoodItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [itemsRes, catRes] = await Promise.all([
        fetch('/api/admin/food-items'),
        fetch('/api/admin/categories')
      ])
      const [itemsData, catData] = await Promise.all([itemsRes.json(), catRes.json()])
      setItems(itemsData)
      setCategories(catData)
    } catch (error) {
      console.error('Failed to fetch:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return
    try {
      await fetch(`/api/admin/food-items?id=${id}`, { method: 'DELETE' })
      await fetchData()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const toggleActive = async (item: FoodItem) => {
    try {
      await fetch('/api/admin/food-items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: item._id, active: !item.active }),
      })
      await fetchData()
    } catch (error) {
      console.error('Failed to toggle:', error)
    }
  }

  const toggleFeatured = async (item: FoodItem) => {
    try {
      await fetch('/api/admin/food-items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: item._id, featured: !item.featured }),
      })
      await fetchData()
    } catch (error) {
      console.error('Failed to toggle featured:', error)
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchesCategory = filterCategory === 'all' || item.categoryId === filterCategory
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && item.active) ||
      (filterStatus === 'paused' && !item.active)
    return matchesSearch && matchesCategory && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-3 md:p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-base md:text-xl font-bold">Food Items</h1>
          <p className="text-[10px] md:text-xs text-muted-foreground">{items.length} items</p>
        </div>
        <Button onClick={() => router.push('/admin/food-items')} size="sm" className="h-7 md:h-8 text-[10px] md:text-xs px-2 md:px-3">
          <Plus className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Add</span> Item
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="pl-8 text-xs h-8"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-7 px-2 text-[10px] md:text-xs rounded-full border border-input bg-background shrink-0"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-7 px-2 text-[10px] md:text-xs rounded-full border border-input bg-background shrink-0"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <Card className="p-6 text-center border-0 shadow-sm">
          <p className="text-muted-foreground text-xs">
            {items.length === 0 ? 'No items yet.' : 'No items match filters.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
          {filteredItems.map((item) => (
            <Card key={item._id} className="overflow-hidden border-0 shadow-sm">
              <div className="relative aspect-square bg-muted">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
                    No image
                  </div>
                )}
                {item.featured && (
                  <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[8px] px-1 py-0.5 rounded-full flex items-center gap-0.5">
                    <Star className="w-2 h-2 fill-current" /> Featured
                  </span>
                )}
                <span className={`absolute top-1 right-1 text-[8px] px-1 py-0.5 rounded-full ${item.active ? 'bg-green-500 text-white' : 'bg-muted-foreground text-white'}`}>
                  {item.active ? 'Active' : 'Paused'}
                </span>
              </div>
              <div className="p-2">
                <div className="flex items-start justify-between gap-1 mb-0.5">
                  <h3 className="font-semibold text-[11px] md:text-xs truncate flex-1">{item.name}</h3>
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-muted-foreground text-[10px] truncate">{item.categoryName || 'Uncategorized'}</span>
                  <span className="text-primary font-semibold text-[11px] md:text-xs shrink-0">৳{item.price}</span>
                </div>
                <div className="flex items-center gap-0.5 pt-1.5 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleActive(item)}
                    className="h-6 flex-1 text-[9px] px-1"
                  >
                    {item.active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleFeatured(item)}
                    className={`h-6 w-6 p-0 ${item.featured ? 'text-primary' : ''}`}
                  >
                    <Star className={`w-3 h-3 ${item.featured ? 'fill-current' : ''}`} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => router.push(`/admin/food-items?edit=${item._id}`)}
                    className="h-6 w-6 p-0"
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(item._id)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
