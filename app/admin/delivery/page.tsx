"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Pencil, Trash2, RefreshCw, X, MapPin } from "lucide-react"

interface DeliveryArea {
  _id: string
  name: string
  charge: number
  active: boolean
}

export default function AdminDeliveryPage() {
  const [areas, setAreas] = useState<DeliveryArea[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editArea, setEditArea] = useState<DeliveryArea | null>(null)
  const [formData, setFormData] = useState({ name: "", charge: 0 })

  const fetchAreas = async () => {
    try {
      const response = await fetch("/api/admin/delivery")
      const data = await response.json()
      setAreas(data.areas || [])
    } catch (error) {
      console.error("Failed to fetch delivery areas:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAreas()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editArea) {
        await fetch("/api/admin/delivery", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editArea._id, ...formData }),
        })
      } else {
        await fetch("/api/admin/delivery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
      }
      setShowForm(false)
      setEditArea(null)
      setFormData({ name: "", charge: 0 })
      fetchAreas()
    } catch (error) {
      console.error("Failed to save:", error)
    }
  }

  const handleEdit = (area: DeliveryArea) => {
    setEditArea(area)
    setFormData({ name: area.name, charge: area.charge })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this area?")) return
    try {
      await fetch(`/api/admin/delivery?id=${id}`, { method: "DELETE" })
      fetchAreas()
    } catch (error) {
      console.error("Failed to delete:", error)
    }
  }

  const toggleActive = async (area: DeliveryArea) => {
    try {
      await fetch("/api/admin/delivery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: area._id, active: !area.active }),
      })
      fetchAreas()
    } catch (error) {
      console.error("Failed to toggle:", error)
    }
  }

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
          <h1 className="text-base md:text-xl font-sans font-semibold">Delivery Areas</h1>
          <p className="text-[10px] md:text-xs text-muted-foreground">{areas.filter(a => a.active).length} active</p>
        </div>
        <Button 
          size="sm" 
          onClick={() => {
            setEditArea(null)
            setFormData({ name: "", charge: 0 })
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
        <div className="fixed inset-0 bg-foreground/20 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-0 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{editArea ? "Edit Area" : "Add New Area"}</CardTitle>
                <button onClick={() => setShowForm(false)} className="p-1 hover:bg-muted rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-xs">Area Name</Label>
                  <Input
                    className="mt-1 h-9 text-sm"
                    placeholder="e.g. Gulshan, Banani, Dhanmondi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="text-xs">Delivery Charge (BDT)</Label>
                  <Input
                    type="number"
                    className="mt-1 h-9 text-sm"
                    placeholder="e.g. 60"
                    value={formData.charge}
                    onChange={(e) => setFormData({ ...formData, charge: Number(e.target.value) })}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 text-sm">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 text-sm">
                    {editArea ? "Update" : "Add"} Area
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Areas List */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {areas.length === 0 ? (
            <div className="text-center py-6">
              <MapPin className="w-6 h-6 mx-auto text-muted-foreground/50 mb-1" />
              <p className="text-xs text-muted-foreground">No delivery areas yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {areas.map((area) => (
                <div key={area._id} className="flex items-center justify-between p-2.5 md:p-3">
                  <div className="flex items-center gap-2">
                    <Switch checked={area.active} onCheckedChange={() => toggleActive(area)} className="scale-75" />
                    <div>
                      <p className="text-[11px] md:text-xs font-medium">{area.name}</p>
                      <p className="text-[10px] text-muted-foreground">৳{area.charge}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(area)} className="h-6 w-6 p-0">
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(area._id)} className="h-6 w-6 p-0 text-red-500 hover:text-red-600">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Card */}
      {areas.length > 0 && (
        <Card className="border-0 shadow-sm bg-primary/5">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] md:text-xs text-muted-foreground">Active Areas</p>
                <p className="text-lg md:text-xl font-bold text-primary">{areas.filter(a => a.active).length}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] md:text-xs text-muted-foreground">Price Range</p>
                <p className="text-xs md:text-sm font-medium">
                  ৳{Math.min(...areas.map(a => a.charge))} - ৳{Math.max(...areas.map(a => a.charge))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
