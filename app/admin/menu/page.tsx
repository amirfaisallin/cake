"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Pencil, Trash2, RefreshCw, X } from "lucide-react"

interface MenuItem {
  _id: string
  type: string
  name: string
  label: string
  price?: number
  multiplier?: number
  active: boolean
}

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState({
    type: "cake_type",
    name: "",
    label: "",
    price: 0,
    multiplier: 1,
  })

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/admin/menu")
      const data = await response.json()
      setItems(data.items || [])
    } catch (error) {
      console.error("Failed to fetch menu items:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editItem) {
        await fetch("/api/admin/menu", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editItem._id, ...formData }),
        })
      } else {
        await fetch("/api/admin/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
      }
      setShowForm(false)
      setEditItem(null)
      setFormData({ type: "cake_type", name: "", label: "", price: 0, multiplier: 1 })
      fetchItems()
    } catch (error) {
      console.error("Failed to save:", error)
    }
  }

  const handleEdit = (item: MenuItem) => {
    setEditItem(item)
    setFormData({
      type: item.type,
      name: item.name,
      label: item.label,
      price: item.price || 0,
      multiplier: item.multiplier || 1,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return
    try {
      await fetch(`/api/admin/menu?id=${id}`, { method: "DELETE" })
      fetchItems()
    } catch (error) {
      console.error("Failed to delete:", error)
    }
  }

  const toggleActive = async (item: MenuItem) => {
    try {
      await fetch("/api/admin/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item._id, active: !item.active }),
      })
      fetchItems()
    } catch (error) {
      console.error("Failed to toggle:", error)
    }
  }

  const cakeTypes = items.filter(i => i.type === "cake_type")
  const sizes = items.filter(i => i.type === "size")
  const flavors = items.filter(i => i.type === "flavor")

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-5 h-5 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-3 md:p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base md:text-xl font-sans font-semibold">Menu Options</h1>
          <p className="text-[10px] md:text-xs text-muted-foreground">Cake types, sizes, flavors</p>
        </div>
        <Button 
          size="sm" 
          onClick={() => {
            setEditItem(null)
            setFormData({ type: "cake_type", name: "", label: "", price: 0, multiplier: 1 })
            setShowForm(true)
          }}
          className="h-7 md:h-8 text-[10px] md:text-xs px-2 md:px-3"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-foreground/20 z-50 flex items-end md:items-center justify-center">
          <Card className="w-full md:max-w-sm border-0 shadow-xl rounded-t-2xl md:rounded-xl mx-0 md:mx-4">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{editItem ? "Edit Item" : "Add New Item"}</CardTitle>
                <button onClick={() => setShowForm(false)} className="p-1 hover:bg-muted rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <Label className="text-[10px] md:text-xs">Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger className="mt-1 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cake_type">Cake Type</SelectItem>
                      <SelectItem value="size">Size</SelectItem>
                      <SelectItem value="flavor">Flavor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] md:text-xs">Name (ID)</Label>
                    <Input
                      className="mt-1 h-8 text-xs"
                      placeholder="birthday"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] md:text-xs">Label</Label>
                    <Input
                      className="mt-1 h-8 text-xs"
                      placeholder="Birthday Cake"
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    />
                  </div>
                </div>

                {formData.type === "cake_type" && (
                  <div>
                    <Label className="text-[10px] md:text-xs">Base Price (BDT)</Label>
                    <Input
                      type="number"
                      className="mt-1 h-8 text-xs"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    />
                  </div>
                )}

                {formData.type === "size" && (
                  <div>
                    <Label className="text-[10px] md:text-xs">Price Multiplier</Label>
                    <Input
                      type="number"
                      step="0.1"
                      className="mt-1 h-8 text-xs"
                      value={formData.multiplier}
                      onChange={(e) => setFormData({ ...formData, multiplier: Number(e.target.value) })}
                    />
                    <p className="text-[9px] text-muted-foreground mt-1">Final = Base x Multiplier</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 h-8 text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 h-8 text-xs">
                    {editItem ? "Update" : "Add"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cake Types */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs md:text-sm font-medium">Cake Types</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {cakeTypes.length === 0 ? (
            <p className="text-[10px] text-muted-foreground py-4 text-center">No cake types yet</p>
          ) : (
            <div className="divide-y">
              {cakeTypes.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-2.5">
                  <div className="flex items-center gap-2">
                    <Switch checked={item.active} onCheckedChange={() => toggleActive(item)} className="scale-75" />
                    <div>
                      <p className="text-[11px] md:text-xs font-medium">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">৳{item.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} className="h-6 w-6 p-0">
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item._id)} className="h-6 w-6 p-0 text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sizes */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs md:text-sm font-medium">Sizes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {sizes.length === 0 ? (
            <p className="text-[10px] text-muted-foreground py-4 text-center">No sizes yet</p>
          ) : (
            <div className="divide-y">
              {sizes.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-2.5">
                  <div className="flex items-center gap-2">
                    <Switch checked={item.active} onCheckedChange={() => toggleActive(item)} className="scale-75" />
                    <div>
                      <p className="text-[11px] md:text-xs font-medium">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.multiplier}x</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} className="h-6 w-6 p-0">
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item._id)} className="h-6 w-6 p-0 text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flavors */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs md:text-sm font-medium">Flavors</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {flavors.length === 0 ? (
            <p className="text-[10px] text-muted-foreground py-4 text-center">No flavors yet</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {flavors.map((item) => (
                <div key={item._id} className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50 text-[10px] md:text-xs">
                  <Switch checked={item.active} onCheckedChange={() => toggleActive(item)} className="scale-[0.6]" />
                  <span>{item.label}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} className="h-5 w-5 p-0">
                    <Pencil className="w-2.5 h-2.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item._id)} className="h-5 w-5 p-0 text-red-500">
                    <Trash2 className="w-2.5 h-2.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
