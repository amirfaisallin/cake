"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2, GripVertical, Loader2 } from "lucide-react"

interface Category {
  _id: string
  name: string
  slug: string
  description: string
  active: boolean
  order: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', active: true, order: 0 })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await fetch('/api/admin/categories', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ _id: editingId, ...form }),
        })
      } else {
        await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      }
      await fetchCategories()
      resetForm()
    } catch (error) {
      console.error('Failed to save category:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (cat: Category) => {
    setEditingId(cat._id)
    setForm({ name: cat.name, description: cat.description || '', active: cat.active, order: cat.order })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return
    try {
      await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' })
      await fetchCategories()
    } catch (error) {
      console.error('Failed to delete category:', error)
    }
  }

  const toggleActive = async (cat: Category) => {
    try {
      await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: cat._id, active: !cat.active }),
      })
      await fetchCategories()
    } catch (error) {
      console.error('Failed to toggle category:', error)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setShowForm(false)
    setForm({ name: '', description: '', active: true, order: 0 })
  }

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
          <h1 className="font-sans text-base md:text-xl font-bold">Categories</h1>
          <p className="text-[10px] md:text-xs text-muted-foreground">{categories.length} categories</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setShowForm(true) }} 
          size="sm" 
          className="h-7 md:h-8 text-[10px] md:text-xs px-2 md:px-3"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>

      {showForm && (
        <Card className="p-3 md:p-4 border-0 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-xs md:text-sm">{editingId ? 'Edit Category' : 'New Category'}</h2>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] md:text-xs">Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Birthday Cakes"
                  required
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] md:text-xs">Order</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  placeholder="0"
                  className="text-xs h-8"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label className="text-[10px] md:text-xs">Description (Optional)</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description..."
                rows={2}
                className="text-xs resize-none"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="w-3.5 h-3.5 rounded border-border"
              />
              <Label htmlFor="active" className="text-[10px] md:text-xs cursor-pointer">Active</Label>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={saving} className="h-7 text-[10px] md:text-xs">
                {saving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                {editingId ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={resetForm} className="h-7 text-[10px] md:text-xs">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-1.5">
        {categories.length === 0 ? (
          <Card className="p-6 text-center border-0 shadow-sm">
            <p className="text-muted-foreground text-xs">No categories yet.</p>
          </Card>
        ) : (
          categories.map((cat) => (
            <Card key={cat._id} className="p-2.5 md:p-3 border-0 shadow-sm">
              <div className="flex items-center gap-2">
                <GripVertical className="w-3.5 h-3.5 text-muted-foreground hidden sm:block shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-[11px] md:text-xs truncate">{cat.name}</h3>
                    <span className={`text-[8px] md:text-[9px] px-1 py-0.5 rounded-full shrink-0 ${cat.active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                      {cat.active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  {cat.description && (
                    <p className="text-muted-foreground text-[10px] truncate">{cat.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(cat)} className="h-6 w-6 p-0">
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(cat._id)} className="h-6 w-6 p-0 text-destructive hover:text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
