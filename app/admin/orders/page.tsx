"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ShoppingBag, 
  RefreshCw,
  Phone,
  MapPin,
  Calendar,
  Cake
} from "lucide-react"

interface Order {
  _id: string
  orderNumber: string
  customerName: string
  phone: string
  deliveryAddress: string
  cakeType: string
  flavor: string
  size: string
  deliveryDate: string
  deliveryTime: string
  deliveryArea?: string
  deliveryCharge?: number
  referenceImage?: string
  estimatedPrice: number
  specialInstructions?: string
  status: string
  createdAt: string
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  preparing: "bg-purple-100 text-purple-700 border-purple-200",
  ready: "bg-cyan-100 text-cyan-700 border-cyan-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  const fetchOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch(`/api/orders?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("admin_token")
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchOrders()
    } catch (error) {
      console.error("Failed to update:", error)
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
          <h1 className="text-base md:text-xl font-sans font-semibold">Orders</h1>
          <p className="text-[10px] md:text-xs text-muted-foreground">{orders.length} orders</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders} className="h-7 md:h-8 w-7 md:w-8 p-0">
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-2 py-1 rounded-full text-[10px] md:text-xs whitespace-nowrap shrink-0 capitalize transition-colors ${
              filter === s ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <div className="divide-y">
              {orders.map((order) => (
                <div key={order._id} className="p-3 md:p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs md:text-sm">{order.orderNumber}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full capitalize ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[11px] md:text-xs text-muted-foreground">{order.customerName}</p>
                    </div>
                    <p className="text-sm md:text-base font-bold text-primary shrink-0">
                      ৳{order.estimatedPrice + (order.deliveryCharge || 0)}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-1 text-[10px] md:text-xs text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>{order.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{order.deliveryDate}</span>
                    </div>
                    <div className="flex items-center gap-1 col-span-2">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{order.deliveryAddress}</span>
                    </div>
                  </div>

                  {/* Cake Info */}
                  <div className="p-2 bg-muted/50 rounded-lg text-[10px] md:text-xs">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <Cake className="w-3 h-3 text-primary" />
                          <span className="font-medium">{order.cakeType}</span>
                          <span className="text-muted-foreground">- {order.flavor}, {order.size}</span>
                        </div>
                        {order.specialInstructions && (
                          <p className="text-muted-foreground mt-1 line-clamp-2">Note: {order.specialInstructions}</p>
                        )}
                      </div>
                      {order.referenceImage && (
                        <a href={order.referenceImage} target="_blank" rel="noopener noreferrer" className="shrink-0">
                          <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden border-2 border-primary/30">
                            <Image src={order.referenceImage} alt="Ref" fill className="object-cover" />
                          </div>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-muted-foreground">Update:</span>
                    <Select value={order.status} onValueChange={(value) => updateStatus(order._id, value)}>
                      <SelectTrigger className="h-7 text-[10px] md:text-xs flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="preparing">Preparing</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
