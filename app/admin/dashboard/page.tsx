"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  RefreshCw,
  Cake,
  ArrowRight,
  Package,
  UtensilsCrossed,
  Tags,
  Truck
} from "lucide-react"

interface Stats {
  total: number
  pending: number
  confirmed: number
  preparing: number
  ready: number
  delivered: number
  cancelled: number
}

interface RecentOrder {
  _id: string
  orderNumber: string
  customerName: string
  cakeType: string
  status: string
  createdAt: string
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-purple-100 text-purple-700",
  ready: "bg-cyan-100 text-cyan-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("admin_token")
      if (!token) {
        router.push("/admin")
        return
      }

      const [statsRes, ordersRes] = await Promise.all([
        fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/orders?limit=5", { headers: { Authorization: `Bearer ${token}` } })
      ])

      if (!statsRes.ok) {
        router.push("/admin")
        return
      }

      const statsData = await statsRes.json()
      const ordersData = await ordersRes.json()
      
      setStats(statsData)
      setRecentOrders(ordersData.orders?.slice(0, 5) || [])
    } catch (error) {
      console.error("Failed to fetch:", error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-5 h-5 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-3 md:p-6 space-y-3 md:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base md:text-xl font-sans font-semibold">Dashboard</h1>
          <p className="text-[10px] md:text-xs text-muted-foreground">Welcome to Tiny Bites Admin</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} className="h-7 md:h-8 text-[10px] md:text-xs px-2 md:px-3">
          <RefreshCw className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 md:gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-2 md:p-3">
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm md:text-xl font-bold">{stats.total}</p>
                  <p className="text-[9px] md:text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-2 md:p-3">
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <Clock className="w-3 h-3 md:w-4 md:h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm md:text-xl font-bold">{stats.pending}</p>
                  <p className="text-[9px] md:text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-2 md:p-3">
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm md:text-xl font-bold">{stats.confirmed}</p>
                  <p className="text-[9px] md:text-xs text-muted-foreground">Confirmed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-2 md:p-3">
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <Cake className="w-3 h-3 md:w-4 md:h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm md:text-xl font-bold">{stats.preparing}</p>
                  <p className="text-[9px] md:text-xs text-muted-foreground">Preparing</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-2 md:p-3">
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm md:text-xl font-bold">{stats.delivered}</p>
                  <p className="text-[9px] md:text-xs text-muted-foreground">Delivered</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-2 md:p-3">
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                  <XCircle className="w-3 h-3 md:w-4 md:h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm md:text-xl font-bold">{stats.cancelled}</p>
                  <p className="text-[9px] md:text-xs text-muted-foreground">Cancelled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions & Recent Orders */}
      <div className="grid md:grid-cols-2 gap-3 md:gap-4">
        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="p-3 md:pb-3">
            <CardTitle className="text-xs md:text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-1">
            <Link href="/admin/orders" className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] md:text-xs font-medium">View Orders</span>
              </div>
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
            </Link>
            <Link href="/admin/food-items" className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] md:text-xs font-medium">Add Food</span>
              </div>
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
            </Link>
            <Link href="/admin/categories" className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-2">
                <Tags className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] md:text-xs font-medium">Categories</span>
              </div>
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
            </Link>
            <Link href="/admin/delivery" className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] md:text-xs font-medium">Delivery</span>
              </div>
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="p-3 md:pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs md:text-sm font-medium">Recent Orders</CardTitle>
              <Link href="/admin/orders" className="text-[10px] md:text-xs text-primary hover:underline">View all</Link>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {recentOrders.length === 0 ? (
              <div className="text-center py-4">
                <ShoppingBag className="w-6 h-6 mx-auto text-muted-foreground/50 mb-1" />
                <p className="text-[10px] text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[11px] md:text-xs font-medium truncate">{order.customerName}</p>
                        <span className="text-[9px] font-mono text-muted-foreground shrink-0">{order.orderNumber}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{order.cakeType}</p>
                    </div>
                    <span className={`text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ml-2 ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
