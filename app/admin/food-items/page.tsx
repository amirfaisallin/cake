"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, Plus, X, Upload } from "lucide-react"
import Image from "next/image"

interface Category {
  _id: string
  name: string
}

interface FoodItem {
  _id?: string
  name: string
  description: string
  price: number
  image: string
  categoryId: string
  tags: string[]
  sizes: { name: string; price: number }[]
  active: boolean
  featured: boolean
}

export default function FoodItemsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [newSize, setNewSize] = useState({ name: '', price: '' })
  
  const [form, setForm] = useState<FoodItem>({
    name: '',
    description: '',
    price: 0,
    image: '',
    categoryId: '',
    tags: [],
    sizes: [],
    active: true,
    featured: false,
  })

  useEffect(() => {
    fetchData()
  }, [editId])

  const fetchData = async () => {
    try {
      const catRes = await fetch('/api/admin/categories')
      const catData = await catRes.json()
      setCategories(catData.filter((c: Category & { active: boolean }) => c.active))
      
      if (editId) {
        const itemsRes = await fetch('/api/admin/food-items')
        const items = await itemsRes.json()
        const item = items.find((i: FoodItem & { _id: string }) => i._id === editId)
        if (item) {
          setForm({
            name: item.name,
            description: item.description || '',
            price: item.price,
            image: item.image || '',
            categoryId: item.categoryId,
            tags: item.tags || [],
            sizes: item.sizes || [],
            active: item.active,
            featured: item.featured,
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editId) {
        await fetch('/api/admin/food-items', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ _id: editId, ...form }),
        })
      } else {
        await fetch('/api/admin/food-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      }
      router.push('/admin/food-list')
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setSaving(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] })
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter(t => t !== tag) })
  }

  const addSize = () => {
    if (newSize.name && newSize.price) {
      setForm({ ...form, sizes: [...form.sizes, { name: newSize.name, price: Number(newSize.price) }] })
      setNewSize({ name: '', price: '' })
    }
  }

  const removeSize = (index: number) => {
    setForm({ ...form, sizes: form.sizes.filter((_, i) => i !== index) })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-3 md:p-6 space-y-3 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-7 w-7 p-0">
          <ArrowLeft className="w-3.5 h-3.5" />
        </Button>
        <div>
          <h1 className="font-sans text-base md:text-xl font-bold">
            {editId ? 'Edit Item' : 'Add Item'}
          </h1>
          <p className="text-[10px] md:text-xs text-muted-foreground">
            {editId ? 'Update details' : 'Create new menu item'}
          </p>
        </div>
      </div>

      <Card className="p-3 md:p-4 border-0 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-[11px] md:text-xs text-muted-foreground uppercase tracking-wide">Basic Info</h3>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] md:text-xs">Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Chocolate Cake"
                  required
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] md:text-xs">Price (BDT) *</Label>
                <Input
                  type="number"
                  value={form.price || ''}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  placeholder="1200"
                  required
                  className="text-xs h-8"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label className="text-[10px] md:text-xs">Category *</Label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
                className="w-full h-8 px-2 text-xs rounded-md border border-input bg-background"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1">
              <Label className="text-[10px] md:text-xs">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Delicious cake..."
                rows={2}
                className="text-xs resize-none"
              />
            </div>
          </div>

          {/* Image */}
          <div className="space-y-2">
            <h3 className="font-semibold text-[11px] md:text-xs text-muted-foreground uppercase tracking-wide">Image</h3>
            <div className="flex gap-2 items-start">
              <div className="flex-1 space-y-1">
                <Input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="Image URL"
                  className="text-xs h-8"
                />
              </div>
              {form.image && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border shrink-0">
                  <Image src={form.image} alt="Preview" fill className="object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <h3 className="font-semibold text-[11px] md:text-xs text-muted-foreground uppercase tracking-wide">Tags</h3>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1">
                {form.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-muted rounded-full text-[10px]">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-1.5">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag..."
                className="text-xs h-7 flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag} className="h-7 w-7 p-0">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-2">
            <h3 className="font-semibold text-[11px] md:text-xs text-muted-foreground uppercase tracking-wide">Sizes (Optional)</h3>
            {form.sizes.length > 0 && (
              <div className="space-y-1">
                {form.sizes.map((size, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-1.5 bg-muted/50 rounded text-[10px] md:text-xs">
                    <span className="flex-1">{size.name}</span>
                    <span className="text-muted-foreground">৳{size.price}</span>
                    <button type="button" onClick={() => removeSize(idx)} className="text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-1.5">
              <Input
                value={newSize.name}
                onChange={(e) => setNewSize({ ...newSize, name: e.target.value })}
                placeholder="Size (e.g., 1kg)"
                className="text-xs h-7 flex-1"
              />
              <Input
                type="number"
                value={newSize.price}
                onChange={(e) => setNewSize({ ...newSize, price: e.target.value })}
                placeholder="Price"
                className="text-xs h-7 w-20"
              />
              <Button type="button" variant="outline" size="sm" onClick={addSize} className="h-7 w-7 p-0">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-2">
            <h3 className="font-semibold text-[11px] md:text-xs text-muted-foreground uppercase tracking-wide">Settings</h3>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="w-3.5 h-3.5 rounded border-border"
                />
                <span className="text-[10px] md:text-xs">Active</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-3.5 h-3.5 rounded border-border"
                />
                <span className="text-[10px] md:text-xs">Featured</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t">
            <Button type="submit" disabled={saving} className="h-8 text-xs flex-1">
              {saving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
              {editId ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} className="h-8 text-xs">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
